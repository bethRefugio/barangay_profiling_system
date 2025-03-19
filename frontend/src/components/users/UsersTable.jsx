import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Eye, EyeOff, UserPlus, Download } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/user';

const UsersTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        accountType: "",
        status: "Active"
    });

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
    
        const filtered = users.filter((user) =>
            Object.values(user).some(value =>
                typeof value === "string" && value.toLowerCase().includes(term)
            )
        );
    
        setFilteredUsers(filtered);
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };



    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, newUser);
            toast.success('User added successfully!');
            fetchUsers();
            setShowAddForm(false);
            setNewUser({
                name: "",
                email: "",
                accountType: "",
                status: "Active"
            });
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error('Error adding user!');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${selectedUserId}`, newUser);
            toast.success('User updated successfully!');
            fetchUsers();
            setShowEditForm(false);
            setNewUser({
                name: "",
                email: "",
                accountType: "",
                status: "Active"
            });
        } catch (error) {
            console.error("Error editing user:", error);
            toast.error('Error editing user!');
        }
    };

    const handleEditClick = async (user) => {
        setSelectedUserId(user.id);
        try {
            const response = await axios.get(`${API_URL}/${user.id}`);
            setNewUser({
                ...response.data,
                password: '' // Clear password field for security
            });
            setShowEditForm(true);
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error('Error fetching user details!');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteUser = async () => {
        try {
            await axios.delete(`${API_URL}/${userToDelete.id}`);
            toast.success('User deleted!');
            fetchUsers();
            setShowDeleteConfirmation(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error('Error deleting user!');
        }
    };

    const downloadCSV = () => {
            if (filteredUsers.length === 0) {
                toast.warn("No data available to download.");
                return;
            }
    
            const csvHeaders = [
                "Name",
                "Email",
                "Role",
                "Status",
            ];
    
            const csvRows = filteredUsers.map(user =>
                `"${user.name}","${user.email}","${user.accountType}","${user.status}"`
            );
    
            const csvContent = [csvHeaders, ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "user_list.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV file downloaded successfully!");
        };
    

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <ToastContainer />
            <div className='relative flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>User List</h2>
                
                {/* Centered Search & Button Container */}
                <div className='absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-4'>
                    <div className='relative flex items-center w-[300px]'>
                        <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                        <input
                            type='text'
                            placeholder='Search users...'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 w-full 
                                focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <button
                        className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center'
                        onClick={() => {
                            setShowAddForm(true);
                            setShowEditForm(false);
                            setNewUser({
                                name: "",
                                email: "",
                                accountType: "",
                                status: "Active"
                            });
                        }}
                    >
                        <UserPlus size={18} />
                    </button>
                </div>
                <button
                    className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 
                        focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center'
                    onClick={downloadCSV}
                >
                    <Download size={18} className='mr-2' /> Download
                </button>
            </div>

            

            {showAddForm && (
                <form className='mb-6' onSubmit={handleAddUser}>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Full Name</label>
                        <input
                            type='text'
                            name='name'
                            placeholder='e.g., Juan Dela Cruz'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newUser.fullname}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Email</label>
                        <input
                            type='email'
                            name='email'
                            placeholder='e.g., juan.delacruz@gmail.com'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newUser.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col relative'>
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
                        <label className='text-sm mb-1'>Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Enter password'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4  py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newUser.password}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-9 pr-4 pr-10 text-gray-500">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Account Type</label>
                        <select
                            name='accountType'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newUser.accountType}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="Resident">Resident</option>
                            <option value="Staff">Staff</option>
                            <option value="Barangay Captain">Barangay Captain</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className='flex justify-end mt-4'>
                    <button
                        type='button'
                        className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                        onClick={() => setShowAddForm(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                    >
                        Add User
                    </button>
                </div>
            </form>
            )}   
            {showEditForm && (
                <form className='mb-6' onSubmit={handleEditUser}>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Full Name</label>
                            <input
                                type='text'
                                name='name'
                                placeholder='e.g., Juan Dela Cruz'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newUser.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Email</label>
                            <input
                                type='email'
                                name='email'
                                placeholder='e.g., juan.delacruz@gmail.com'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newUser.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col relative'>
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
                            <label className='text-sm mb-1'>Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='Enter new password'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4  py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newUser.password}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-9 pr-4 pr-10 text-gray-500">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Role</label>
                            <select
                                name='accountType'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 pr-10 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newUser.accountType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Select Role</option>
                                <option value="Resident">Resident</option>
                                <option value="Staff">Staff</option>
                                <option value="Barangay Captain">Barangay Captain</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <button type='button' className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2' onClick={() => setShowEditForm(false)}>Cancel</button>
                        <button type='submit' className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'>Update User</button>
                    </div>
                </form>
            )}


            {showDeleteConfirmation && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
                        <h2 className='text-xl font-semibold text-gray-100 mb-4'>Are you sure you want to delete this user?</h2>
                        <div className='flex justify-end'>
                            <button
                                className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                                onClick={handleDeleteUser}
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

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Email
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Role
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredUsers.map((user) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold'>
                                                {user.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className='ml-4'>
                                            <div className='text-sm font-medium text-gray-100'>{user.name}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='text-sm text-gray-300'>{user.email}</div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100'>
                                        {user.accountType}
                                    </span>
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.status === "Active"
                                                ? "bg-green-800 text-green-100"
                                                : "bg-red-800 text-red-100"
                                        }`}
                                    >
                                        {user.status}
                                    </span>
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button
                                        className='text-indigo-400 hover:text-indigo-300 mr-2'
                                        onClick={() => handleEditClick(user)}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className='text-red-400 hover:text-red-300'
                                        onClick={() => handleDeleteClick(user)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default UsersTable;
