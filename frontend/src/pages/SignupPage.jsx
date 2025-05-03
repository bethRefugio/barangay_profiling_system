// filepath: c:\Refugio\Refugio_Barangay_Profiling_System\frontend\src\pages\SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, User, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accountType, setAccountType] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting signup with data:", { name, email, password, accountType });
        try {
            const response = await axios.post('http://localhost:5000/user', { name, email, password, accountType });
            console.log("Signup response:", response);
    
            toast.success("Account was created successfully");
    
            // Redirect to the login page after successful signup
            navigate("/login");
        } catch (err) {
            console.error("Signup error:", err);
            setError('Signup failed. Please try again.');
            toast.error("Signup failed. Please try again.");
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="container-signup relative h-full w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/logo_enhanced.png)' }}>
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
                <h2 className="signup-title text-xl font-bold mb-4 text-white text-center">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group mb-4 relative">
                        <label className="block mb-1 text-white text-lg">Name:</label>
                        <div className="flex items-center border border-gray-700 p-2 w-full text-white rounded-lg bg-gray-800">
                            <User className="mr-2 text-gray-500" />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1 bg-transparent outline-none text-lg text-white" />
                        </div>
                    </div>
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
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </button>   
                        </div>
                    </div>
                    <div className="input-group mb-4 relative">
                        <label className="block mb-1 text-white text-lg">Role:</label>
                        <div className="flex items-center border border-gray-700 p-2 w-full text-white rounded-lg bg-gray-800">
                            <UserPlus className="mr-2 text-gray-500" />
                            <select value={accountType} onChange={(e) => setAccountType(e.target.value)} required className="flex-1 bg-gray-800 outline-none text-lg text-white">
                                <option value="" disabled>Select Role</option>
                                <option value="Resident">Resident</option>
                                <option value="Staff">Staff</option>
                                <option value="Guest">Guest</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                        <button type="submit" className="signup-button bg-blue-500 text-white p-2 rounded-lg text-lg"
                        >Sign Up</button>
                    </div>
                    {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                </form>
                <p className="mt-4 text-white text-lg text-center">Already have an account? <Link to="/login" className="font-bold text-blue-500">Login now</Link></p>
            </div>
        </div>
    );
}

export default SignupPage;