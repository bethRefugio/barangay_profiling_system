import { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = 'http://localhost:5000/user';

const DangerZone = () => {
    const [users, setUsers] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const userId = sessionStorage.getItem("userId"); // Get the logged-in user's ID
	const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteClick = () => {
        if (userId) {
            setUserToDelete(userId);
            setShowDeleteConfirmation(true);
        } else {
            toast.error("No user found to delete!");
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) {
            toast.error("No user selected for deletion!");
            return;
        }

        try {
            await axios.delete(`${API_URL}/${userToDelete}`);
            toast.success('User deleted!');
            sessionStorage.removeItem("userId"); // Clear session
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
            window.location.href = "/"; // Redirect after deletion
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error('Error deleting user!');
        }
    };

	const handleLogout = () => {
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <motion.div
            className='bg-red-900 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-red-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <div className='flex items-center mb-4'>
                <Trash2 className='text-red-400 mr-3' size={24} />
                <h2 className='text-xl font-semibold text-gray-100'>Delete Account</h2>
            </div>
            <p className='text-gray-300 mb-4'>Your account will be deactivated.</p>
            <button
                className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded 
				transition duration-200'
                onClick={handleDeleteClick}
            >
                Delete Account
            </button>

            {showDeleteConfirmation && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
                        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Are you sure you want to delete your account?</h2>
                        <div className='flex justify-end'>
                            <button
                                className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                                onClick={async () => {
									await handleDeleteUser();
									handleLogout();
								}}								
                            >
                                Yes
                            </button>
                            <button
                                className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500'
                                onClick={() => setShowDeleteConfirmation(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default DangerZone;
