/* eslint-disable react/no-unescaped-entities */
///* eslint-disable no-unused-vars */
import { useState } from 'react';
import './LoginForm.css';
import { FaUser, FaLock } from 'react-icons/fa';
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
        <div className="login-form-container">
            <div className='wrapper'>
                <form onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <div className='input-box'>
                        <input
                            type='text'
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FaUser className='icon' />
                    </div>
                    <div className='input-box'>
                        <input
                            type='password'
                            placeholder='Mot de passe'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FaLock className='icon' />
                    </div>
                    {showOtpField && (
                        <div className='input-box'>
                            <input
                                type='text'
                                placeholder='Code OTP'
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                    )}
                    <button type='submit'>Login</button>
                    {showOtpField && (
                        <button type='button' onClick={handleVerifyOtp}>
                            Valider le code OTP
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default LoginForm;