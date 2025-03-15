import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password }, { withCredentials: true });
            console.log("Response from server:", response.data); // Log the response
            if (response.status === 200) {
                const { userId } = response.data;
                sessionStorage.setItem('userId', userId);
                console.log("Login successful", response.data);
                navigate('/overview');
            } else {
                console.error('Login failed:', response.data.message);
                setError('Invalid email or password');
            }
        } catch (err) {
            console.error("Login error:", err); // Log the error
            setError('Invalid email or password');
        }
    };

    return (
        <div className="container-login bg-gray-800 p-6 rounded-lg shadow-md z-10">
            <h2 className="login-title text-xl font-bold mb-4 text-white">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group mb-4">
                    <label className="block mb-1">Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <div className="input-group mb-4">
                    <label className="block mb-1">Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <button type="submit" className="login-button bg-blue-500 text-white p-2 rounded">Login</button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
            <p className="mt-4">Don't have an account? <Link to="/signup" className="font-bold text-blue">Signup now</Link></p>
            <div className="fixed inset-0 z-0 bg-transparent pointer-events-none"></div>
        </div>
    );
};

export default LoginPage;