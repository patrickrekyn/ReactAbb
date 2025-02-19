
import { useState } from 'react';
import './LoginForm.css';
import sombiniainaImage from './sombiniaina.jpg';
import axios from 'axios';
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7265/api/oracledata/login', {
                Email: email,
                Password: password,
            });
            if (response.status === 200) {
                setShowOtpField(true); // Afficher le champ OTP
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                console.error('Erreur lors de la connexion:', error.message);
                alert('Une erreur s\'est produite lors de la connexion.');
            }
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const response = await axios.post('https://localhost:7265/api/oracledata/verify-otp', {
                Email: email,
                Otp: otp,
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userInfo', JSON.stringify(response.data.user));
                window.location.href = '/dashboardlayoutbasic';
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data);
            } else {
                console.error('Erreur lors de la vérification du code OTP:', error.message);
                alert('Une erreur s\'est produite lors de la vérification du code OTP.');
            }
        }
    };
  
    return (
        
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
            <div className="login-container row shadow-lg rounded-4 overflow-hidden">
                <div className="col-lg-4 p-5 form-section">
                    <h2 className="mb-4 fw-bold">Welcome Back</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                type='text'
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type='password'
                                placeholder='Mot de passe'
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {/*<div className="mb-4 form-check">*/}
                        {/*    <input*/}
                        {/*        type="checkbox"*/}
                        {/*        className="form-check-input"*/}
                        {/*        id="remember"*/}
                        {/*        checked={rememberMe}*/}
                        {/*        onChange={(e) => setRememberMe(e.target.checked)}*/}
                        {/*    />*/}
                        {/*    <label className="form-check-label" htmlFor="remember">Remember me</label>*/}
                        {/*</div>*/}
                        {showOtpField && (
                            <div className='mb-4'>
                                <input
                                    type='text'
                                    placeholder='Code OTP'
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary w-100 mb-3">Sign In</button>
                        {showOtpField && (
                            <button type='button' onClick={handleVerifyOtp}>
                                Valider le code OTP
                            </button>
                        )}
                        <div className="text-center">
                            <a href="#" className="text-decoration-none">Forgot password?</a>
                        </div>
                        <div className="social-login mt-4">
                            <p className="text-center mb-3">Or sign in with</p>
                            <div className="d-flex justify-content-center gap-3">
                                <button type="button" className="btn btn-outline-secondary">Google</button>
                                <button type="button" className="btn btn-outline-secondary">Facebook</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="col-lg-8 d-none d-lg-block p-0">
                    <div className="h-100 image-container">
                        <img
                            src={sombiniainaImage}
                            alt="Login Background"
                            className="login-image"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;