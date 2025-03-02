import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accountType, setAccountType] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting signup with data:", { name, email, password, accountType });
        try {

            const response = await axios.post('http://localhost:5000/user', { name, email, password, accountType });
            console.log("Signup response:", response);

            // Handle successful signup (e.g., redirect to login)
            if (response.status === 200) {
                navigate('/login'); // Redirect to login page
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError('Signup failed. Please try again.'); 

        }
    };

    return (
        <div className="container-signup bg-gray-800 p-6 rounded-lg shadow-md z-10">
            <h2 className="signup-title text-xl font-bold mb-4 text-white">Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group mb-4">
                    <label className="block mb-1 text-white">Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <div className="input-group mb-4">
                    <label className="block mb-1 text-white">Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <div className="input-group mb-4">
                    <label className="block mb-1 text-white">Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <div className="input-group mb-4">
                    <label className="block mb-1 text-white">Role:</label>
                    <input type="text" value={accountType} onChange={(e) => setAccountType(e.target.value)} required className="border border-gray-300 p-2 w-full text-black" />
                </div>
                <button type="submit" className="signup-button bg-blue-500 text-white p-2 rounded">Sign Up</button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
            <p className="mt-4 text-white">Already have an account? <Link to="/login" className="text-blue-500">Login now</Link></p>
        </div>
    );
};

export default SignupPage;
