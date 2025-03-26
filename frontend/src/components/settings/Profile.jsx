import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye, EyeOff } from "lucide-react";
import SettingSection from "./SettingSection";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [profilePhoto, setProfilePhoto] = useState('backend/uploads/default-profile.png'); // Set default profile photo initially
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = sessionStorage.getItem('userId'); // Get userId from sessionStorage
                if (!userId) {
                    throw new Error('User ID not found in session storage');
                }
                const response = await axios.get(`http://localhost:5000/user/${userId}`, { withCredentials: true });
                setUser(response.data);
                setUpdatedUser({
                    name: response.data.name,
                    email: response.data.email,
                    password: '' // Password is not fetched for security reasons
                });
                setProfilePhoto(response.data.profilePhoto || 'backend/uploads/default-profile.png'); // Set default profile photo if not available
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({ ...updatedUser, [name]: value });
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        try {
            const userId = sessionStorage.getItem('userId');
    
            // Create FormData object for image upload
            const formData = new FormData();
            formData.append('name', updatedUser.name);
            formData.append('email', updatedUser.email);
            if (updatedUser.password) {
                formData.append('password', updatedUser.password);
            }
    
            // Check if a new profile photo was selected
            if (profilePhoto instanceof File) {
                formData.append('profilePhoto', profilePhoto);
            }
    
            // Debugging: Log what is being sent
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
    
            await axios.put(`http://localhost:5000/user/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
    
            toast.success('Profile updated successfully!');
            setEditMode(false);
            setUser({ ...user, ...updatedUser });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile!');
        }
    };
    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePhoto(file);
        }
    };
    

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <SettingSection icon={User} title={"Profile"}>
            <ToastContainer />
            <div className='flex flex-col sm:flex-row items-center mb-6'>
                <img
                    src={`http://localhost:5000/${profilePhoto}`}
                    alt='Profile'
                    className='rounded-full w-20 h-20 object-cover mr-4'
                />

                <div>
                    <h3 className='text-lg font-semibold text-gray-100'>{user.name}</h3>
                    <p className='text-gray-400'>{user.email}</p>
                    <p className='text-gray-400'>{user.accountType}</p>
                </div>
            </div>

            {editMode ? (
                <form onSubmit={handleEditProfile}>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Full Name</label>
                        <input
                            type='text'
                            name='name'
                            placeholder='Name'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={updatedUser.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Email</label>
                        <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={updatedUser.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Password</label>
                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Password'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
                                value={updatedUser.password}
                                onChange={handleInputChange}
                            />
                            <button
                                type='button'
                                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400'
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    
                        <div className='col-span-2'>
                            <label className='block text-gray-400 mb-2'>Profile Photo</label>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleProfilePhotoChange}
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <button
                            type='button'
                            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                            onClick={() => setEditMode(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            ) : (
                <div className='flex justify-between'>
                    <button
                        className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile
                    </button>
                    <button
                        className='bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto ml-4'
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </SettingSection>
    );
};

export default Profile;