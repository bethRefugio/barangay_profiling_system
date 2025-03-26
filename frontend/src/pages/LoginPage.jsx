import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Eye, EyeOff } from "lucide-react";
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password }, { withCredentials: true });
            console.log("Response from server:", response.data);
    
            if (response.status === 200) {
                const { userId } = response.data;
                sessionStorage.setItem('userId', userId);
                console.log("Login successful", response.data);
                navigate('/overview');
            }
        } catch (err) {
            console.error("Login error:", err.response?.data?.message || err.message);
            
            if (err.response?.status === 403 && err.response?.data?.message === "This account doesn't exist anymore") {
                setError("This account doesn't exist anymore");
            } else {
                setError("Invalid email or password");
            }
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="container-login relative h-full w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/logo_enhanced.png)' }}>
            <div className="absolute inset-0 bg-gray-700 bg-opacity-70"></div>
            <div className="relative z-10 bg-gray-800 p-6 rounded-lg shadow-md">
                <style>
                    {`
                    /* Hide the eye icon in Microsoft Edge */
                    input::-ms-reveal {
                      display: none;
                    }

                    /* Hide the eye icon in Chrome, Safari */
                    input::-webkit-credentials-auto-fill-button {
                      display: none;
                    }
                    `}
                </style>
                <h2 className="login-title text-xl font-bold mb-4 text-white text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group mb-4 relative">
                        <label className="block mb-1 text-white text-lg">Email:</label>
                        <div className="flex items-center border border-gray-700 p-2 w-full text-white rounded-lg bg-gray-800">
                            <Mail className="mr-2 text-gray-500" />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="flex-1 bg-transparent outline-none text-lg text-white" />
                        </div>
                    </div>
                    <div className="input-group mb-4 relative">
                        <label className="block mb-1 text-white text-lg">Password:</label>
                        <div className="flex items-center border border-gray-700 p-2 w-full text-white rounded-lg bg-gray-800">
                            <KeyRound className="mr-2 text-gray-500" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="flex-1 bg-transparent outline-none text-lg text-white" style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }} />
                            <button type="button" onClick={togglePasswordVisibility} className="text-gray-500">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <button type="submit" className="login-button bg-blue-500 text-white p-2 rounded-lg text-lg">Login</button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                </form>
                <p className="mt-4 text-white text-lg text-center">Don't have an account? <Link to="/signup" className="font-bold text-blue-500">Signup now</Link></p>
            </div>
        </div>
    );
};

export default LoginPage;