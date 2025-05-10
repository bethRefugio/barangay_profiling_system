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
    const [profilePhoto, setProfilePhoto] = useState('backend/uploads/default-profile.png');
    const [qrCode, setQRCode] = useState(null); // State to store the QR code
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = sessionStorage.getItem('userId');
                if (!userId) {
                    throw new Error('User ID not found in session storage');
                }
                const response = await axios.get(`http://localhost:5000/user/${userId}`, { withCredentials: true });
                setUser(response.data);
                setUpdatedUser({
                    name: response.data.name,
                    email: response.data.email,
                    password: ''
                });
                setProfilePhoto(response.data.profilePhoto || 'backend/uploads/default-profile.png');

                // Fetch the QR code based on the user's account type
                if (response.data.accountType === 'Resident') {
                    const residentResponse = await axios.get(`http://localhost:5000/resident/${response.data.linkedId}`);
                    setQRCode(residentResponse.data.qrCode);
                } else if (response.data.accountType === 'Staff') {
                    const officialResponse = await axios.get(`http://localhost:5000/official/${response.data.linkedId}`);
                    setQRCode(officialResponse.data.qrCode);
                }
            } catch (error) {
                console.error('Error fetching user or QR code:', error);
            }
        };

        fetchUser();
    }, []);

    const handleDownloadQRCode = () => {
        if (!qrCode) return;

        const link = document.createElement('a');
        link.href = qrCode;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUser({ ...updatedUser, [name]: value });
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        try {
            const userId = sessionStorage.getItem('userId');

            const formData = new FormData();
            formData.append('name', updatedUser.name);
            formData.append('email', updatedUser.email);
            if (updatedUser.password) {
                formData.append('password', updatedUser.password);
            }

            if (profilePhoto instanceof File) {
                formData.append('profilePhoto', profilePhoto);
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
            <div className='flex flex-col sm:flex-row items-center justify-between mb-6'>
                <div className='flex flex-col sm:flex-row items-center'>
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

                <button
                    className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4 sm:mt-0'
                    onClick={() => setEditMode(true)}
                >
                    Edit Profile
                </button>
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
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
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
                <div className='flex flex-col items-center justify-start'>
                    
                   

                    {qrCode && (
                        <div className='mt-6 text-center'>
                            <h3 className='text-lg font-semibold text-gray-100'>Your QR Code</h3>
                            <img
                                src={qrCode}
                                alt='QR Code'
                                className='w-40 h-40 object-contain mx-auto mt-4'
                            />
                            <button
                                className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-4'
                                onClick={handleDownloadQRCode}
                            >
                                Download QR Code
                            </button>
                        </div>
                    )}
                </div>
            )}
        </SettingSection>
    );
};

export default Profile;