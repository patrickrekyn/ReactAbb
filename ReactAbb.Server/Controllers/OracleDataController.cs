using Dapper;
using Microsoft.AspNetCore.Mvc;
using Oracle.ManagedDataAccess.Client;
using ReactAbb.Server.Models;
using System.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Cryptography;
using ReactAbb.Server.Services;

namespace ReactAbb.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OracleDataController : ControllerBase
    {
        private readonly IConfiguration _config;

        public OracleDataController(IConfiguration config)
        {
            _config = config;
        }

        [Authorize]
        [HttpGet("utilisateurs")]
        public async Task<IActionResult> GetUtilisateurs()
        {
            try
            {
                using (IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    var utilisateurs = await connection.QueryAsync<Utilisateurs>(
                        "SELECT * FROM UTILISATEURS");

                    return Ok(utilisateurs);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                using (var connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    await connection.OpenAsync();
                    return Ok("Connection successful");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Connection failed: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                using (IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection")))
                {
                    var utilisateur = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                        "SELECT * FROM UTILISATEURS WHERE EMAIL = :Email",
                        new { Email = loginRequest.Email });

                    if (utilisateur == null)
                    {
                        return Unauthorized("Utilisateur non trouvé.");
                    }

                    // Vérifiez le mot de passe haché
                    if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, utilisateur.PASSWORD))
                    {
                        return Unauthorized("Mot de passe incorrect.");
                    }

                    // Générer un code OTP à 6 chiffres
                    var otp = GenerateOtp();
                    var emailService = new EmailService(_config);

                    // Envoyer le code OTP par e-mail
                    emailService.SendEmail(utilisateur.EMAIL, "Code de confirmation", $"Votre code de confirmation est : {otp}");

                    // Stocker le code OTP temporairement (par exemple, en mémoire ou dans une base de données)
                    // Ici, nous utilisons un dictionnaire en mémoire pour simplifier
                    _otpStore[utilisateur.EMAIL] = otp;

                    return Ok(new { Message = "Code de confirmation envoyé par e-mail.", Email = utilisateur.EMAIL });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private static string GenerateOtp()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // Code à 6 chiffres
        }

        // Dictionnaire pour stocker les codes OTP temporairement
        private static readonly Dictionary<string, string> _otpStore = new();

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest verifyOtpRequest)
        {
            if (!_otpStore.TryGetValue(verifyOtpRequest.Email, out var storedOtp))
            {
                return BadRequest("Aucun code OTP trouvé pour cet e-mail.");
            }

            if (storedOtp != verifyOtpRequest.Otp)
            {
                return Unauthorized("Code OTP incorrect.");
            }

            // Supprimer le code OTP après validation
            _otpStore.Remove(verifyOtpRequest.Email);

            using (IDbConnection connection = new OracleConnection(
                _config.GetConnectionString("OracleConnection")))
            {
                var utilisateur = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                    "SELECT * FROM UTILISATEURS WHERE EMAIL = :Email",
                    new { Email = verifyOtpRequest.Email });

                // Générer un token JWT
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(ClaimTypes.Name, verifyOtpRequest.Email),
                        new Claim(ClaimTypes.NameIdentifier, utilisateur.ID.ToString())
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    Issuer = _config["Jwt:Issuer"],
                    Audience = _config["Jwt:Audience"],
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                // Enregistrer la session
                if (utilisateur == null || utilisateur.ID == null)
                {
                    return BadRequest("Utilisateur non trouvé ou ID manquant.");
                }

               

                // Enregistrer la session avec l'ID généré
                await connection.ExecuteAsync(
                    @"INSERT INTO SESSIONS ( USER_ID, TOKEN, LOGIN_TIME, IS_ACTIVE) 
                    VALUES ( :UserId, :Token, :LoginTime, 1)",
                    new
                    {
                        UserId = utilisateur.ID,
                        Token = tokenString,
                        LoginTime = DateTime.UtcNow
                    });

                return Ok(new { Token = tokenString, Message = "Connexion réussie." });
            }
        }

        public class VerifyOtpRequest
        {
            public string Email { get; set; }
            public string Otp { get; set; }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerRequest)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));
                // Vérifiez si l'utilisateur existe déjà
                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                    "SELECT * FROM UTILISATEURS WHERE EMAIL = :Email",
                    new { Email = registerRequest.Email });

                if (existingUser != null)
                {
                    return BadRequest("Un utilisateur avec cet email existe déjà.");
                }

                // Hacher le mot de passe
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password);

                // Insérer le nouvel utilisateur dans la base de données
                var sql = @"
                INSERT INTO UTILISATEURS (EMAIL,PASSWORD)
                VALUES (:Email, :Password)";
                await connection.ExecuteAsync(sql, new
                {
                    Email = registerRequest.Email,
                    Password = hashedPassword
                });

                return Ok("Inscription réussie !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("utilisateurs/{id}")]
        public async Task<IActionResult> EditUtilisateur(int id, [FromBody] UtilisateurUpdateRequest updateRequest)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                    "SELECT * FROM UTILISATEURS WHERE ID = :Id",
                    new { Id = id });

                if (existingUser == null)
                {
                    return NotFound("Utilisateur non trouvé.");
                }

                var sql = @"
                UPDATE UTILISATEURS
                SET EMAIL = :Email
                WHERE ID = :Id";

                await connection.ExecuteAsync(sql, new
                {
                    Email = updateRequest.Email,
                    Id = id
                });

                return Ok("Utilisateur mis à jour avec succès !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("utilisateurs/{id}")]
        public async Task<IActionResult> DeleteUtilisateur(int id)
        {
            try
            {
                using IDbConnection connection = new OracleConnection(
                    _config.GetConnectionString("OracleConnection"));

                var existingUser = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                    "SELECT * FROM UTILISATEURS WHERE ID = :Id",
                    new { Id = id });

                if (existingUser == null)
                {
                    return NotFound("Utilisateur non trouvé.");
                }

                var sql = "DELETE FROM UTILISATEURS WHERE ID = :Id";
                await connection.ExecuteAsync(sql, new { Id = id });

                return Ok("Utilisateur supprimé avec succès !");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class RegisterRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class UtilisateurUpdateRequest
        {
            public string Email { get; set; }
        }
        [Authorize]
        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            using (IDbConnection connection = new OracleConnection(
                _config.GetConnectionString("OracleConnection")))
            {
                var utilisateur = await connection.QueryFirstOrDefaultAsync<Utilisateurs>(
                    "SELECT * FROM UTILISATEURS WHERE ID = :Id",
                    new { Id = userId });

                if (utilisateur == null)
                {
                    return NotFound("Utilisateur non trouvé.");
                }

                return Ok(new { utilisateur.EMAIL, utilisateur.ID });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var token = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            using (IDbConnection connection = new OracleConnection(
                _config.GetConnectionString("OracleConnection")))
            {
                await connection.ExecuteAsync(
                    @"UPDATE SESSIONS 
            SET LOGOUT_TIME = :LogoutTime, IS_ACTIVE = 0 
            WHERE USER_ID = :UserId AND TOKEN = :Token",
                    new
                    {
                        LogoutTime = DateTime.UtcNow,
                        UserId = userId,
                        Token = token
                    });
            }

            return Ok("Déconnexion réussie");
        }
    }
}