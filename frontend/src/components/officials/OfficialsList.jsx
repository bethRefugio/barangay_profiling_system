import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PhoneIncoming, Edit, Mail, Trash2, UserPlus, Search, Download } from "lucide-react";
import axios from "axios";
import Papa from "papaparse"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteOfficialConfirmation from './DeleteOfficialConfirmation';
import { QRCodeCanvas } from "qrcode.react"; // Use QRCodeCanvas for QR code generation

const API_URL = 'http://localhost:5000/official';

const OfficialsList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [officials, setOfficials] = useState([]);
    const [filteredOfficials, setFilteredOfficials] = useState([]);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation
    const [selectedOfficialId, setSelectedOfficialId] = useState(null);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [newOfficial, setNewOfficial] = useState({
        fullname: "",
        position: "",
        phone: "",
        email: ""
    });
    const [accountType, setAccountType] = useState(null);
    
    const fetchOfficials = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            setOfficials(response.data);
        } catch (error) {
            console.error("Error fetching officials:", error);
        }
    }, []);

   
    useEffect(() => {
            const fetchUserData = async () => {
                try {
                    const userId = sessionStorage.getItem('userId'); // Get userId from sessionStorage
                    if (!userId) {
                        throw new Error('User ID not found in session storage');
                    }
                    console.log(`Fetching user data for userId: ${userId}`);
                    const response = await axios.get(`http://localhost:5000/user/${userId}`, { withCredentials: true });
                    setAccountType(response.data.accountType.toLowerCase());
                    console.log(`Fetched accountType: ${response.data.accountType}`);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };
    
            fetchUserData();
        fetchOfficials();
    }, [fetchOfficials]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOfficial({ ...newOfficial, [name]: value });
    };

    const handleEditClick = async (official) => {
        setSelectedOfficialId(official._id);
        try {
            const response = await axios.get(`${API_URL}/${official._id}`);
            setNewOfficial(response.data);
            setShowEditForm(true);
        } catch (error) {
            console.error("Error fetching official details:", error);
            toast.error('Error fetching official details!');
        }
    };

    const handleEditOfficial = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('fullname', newOfficial.fullname);
            formData.append('position', newOfficial.position);
            formData.append('phone', newOfficial.phone);
            formData.append('email', newOfficial.email);
    
            // Check if a new profile photo was selected
            if (newOfficial.profilePhoto instanceof File) {
                formData.append('profilePhoto', newOfficial.profilePhoto);
            }
    
            // Debug: Log what is being sent
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
    
            const response = await axios.put(`${API_URL}/${selectedOfficialId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            toast.success('Official updated successfully!');
            fetchOfficials();
            setShowEditForm(false);
            setNewOfficial({
                fullname: "",
                position: "",
                phone: "",
                email:"",
                profilePhoto: null
            });
    
        } catch (error) {
            console.error("Error editing official:", error);
            toast.error('Error editing official!');
        }
    };
     
       
    

    const handleDeleteClick = (officialId) => {
        setSelectedOfficialId(officialId);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteOfficial = async () => {
        try {
            await axios.delete(`${API_URL}/${selectedOfficialId}`);
            toast.success('Official deleted successfully!');
            fetchOfficials();
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error("Error deleting official:", error);
            toast.error('Error deleting official!');
        }
    };

    const handleAddOfficial = async (e) => {
        e.preventDefault();
        try {
            let profilePhotoPath = 'uploads/default-profile.png';
    
            if (newOfficial.profilePhoto) {
                const formData = new FormData();
                formData.append('profilePhoto', newOfficial.profilePhoto);
                formData.append('officialId', newOfficial.id);
    
                const uploadResponse = await axios.post('http://localhost:5000/upload-official-photo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
    
                profilePhotoPath = uploadResponse.data.profilePhoto;
            }
    
            await axios.post(API_URL, { ...newOfficial, profilePhoto: profilePhotoPath });
    
            toast.success('Official added successfully!');
            fetchOfficials();
            setShowAddForm(false);
            setNewOfficial({
                fullname: "",
                position: "",
                phone: "",
                email:"",
                profilePhoto: null,
            });
        } catch (error) {
            console.error("Error adding official:", error);
            toast.error('Error adding official!');
        }
    };
    

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = officials.filter((official) => // Fix the typo here
            Object.entries(official).some(([key, value]) => {
                return value.toString().toLowerCase().includes(term);
            })
        );
    
        setFilteredOfficials(filtered);
    };

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredOfficials(officials);
        }
    }, [searchTerm, officials]);
    
    const handleDownloadQR = (qrCodeUrl, fullname) => {
        const link = document.createElement("a");
        link.href = qrCodeUrl; // Use the QR code URL
        link.download = `${fullname}_QR_Code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR Code downloaded successfully!");
    };

    const downloadCSV = () => {
            if (filteredOfficials.length === 0) {
                toast.warn("No data available to download.");
                return;
            }
    
            const csvHeaders = [
                "Full Name, Position, Phone, Email, QR Code"
            ];
    
            const csvRows = filteredOfficials.map(official =>
                `"${official.fullname}","${official.position}","${official.phone}", "${official.email}","${official.qrCode}"`
            );
    
            const csvContent = [csvHeaders, ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "officials_list.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV file downloaded successfully!");
        };

        const downloadJSON = () => {
                if (filteredOfficials.length === 0) {
                    toast.warn("No data available to download.");
                    return;
                }
        
                const jsonContent = JSON.stringify(filteredOfficials, null, 2);
                const blob = new Blob([jsonContent], { type: "application/json"});
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "officials_list.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("JSON file downloaded successfully");
            };

    return (
        <div>
            <ToastContainer />
            <h2 className="text-4xl font-bold mb-8 text-center">Brgy. Bunawan List of Officials</h2>
            
            <div className="flex justify-center items-center space-x-4 mb-10">
           <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search official..."
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-6 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleSearch}
                    value={searchTerm}
                />
            </div>
            {(accountType === "admin" || accountType === "barangay captain") && (
                <div className="flex space-x-4">
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                onClick={() => setShowAddForm(true)}
            >
                <UserPlus size={18} />
            </button>

            <button
                className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 
                    focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center'
                onClick={() => setShowDownloadModal(true)}
            >
                <Download size={18} className='mr-2' /> Download
            </button>
            </div>
            )}
        </div>


        {/* Download Modal */}
        {showDownloadModal && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                <div className='bg-gray-800 p-6 rounded-lg shadow-lg w-96'>
                    <h3 className='text-lg font-semibold text-gray-100 mb-4'>Download Options</h3>
                    <p className='text-gray-400 mb-6'>Choose the format to download the residents' data:</p>
                    <div className='flex justify-between'>
                        <button
                            className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            onClick={() => {
                                downloadCSV();
                                setShowDownloadModal(false);
                            }}
                        >
                            Download as CSV
                        </button>
                        <button
                            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                            onClick={() => {
                                downloadJSON();
                                setShowDownloadModal(false);
                            }}
                        >
                            Download as JSON
                        </button>
                    </div>
                    <button
                        className='mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
                        onClick={() => setShowDownloadModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {showAddForm && (
        <form className='mb-6' onSubmit={handleAddOfficial}>
            <div className='grid grid-cols-1 md:grid-cols-2 pl-20 gap-y-2 gap-x-0'>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Full Name</label>
                        <input
                            type='text'
                            name='fullname'
                            placeholder='e.g., Juan Dela Cruz'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                            value={newOfficial.fullname}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Position</label>
                        <select
                            name='position'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                            value={newOfficial.position}
                            onChange={handleInputChange}
                            required
                        >
                            <option value='' disabled>Select Position</option>
                            <option value="Barangay Captain">Barangay Captain</option>
                            <option value="Kagawad">Barangay Councilor (Kagawad)</option>
                            <option value="SK Chairperson">Sangguniang Kabataan (SK) Chairperson</option>
                            <option value="Barangay Secretary">Barangay Secretary</option>
                            <option value="Barangay Treasure">Barangay Treasurer</option>
                            <option value="Barangay Tanod">Barangay Tanod (Peace and Order Officer)</option>
                            <option value="Barangay Health Worker(BHW)">Barangay Health Worker (BHW)</option>
                            <option value="Barangay Nutrition Scholar (BNS)">Barangay Nutrition Scholar (BNS)</option>
                            <option value="Lupon Member">Barangay Lupon Member</option>
                            <option value="BDRRMC Member">Barangay Disaster Risk Reduction and Management Council (BDRRMC) Member</option>
                        </select>
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Phone</label>
                        <input
                            type='text'
                            name='phone'
                            placeholder='e.g., 0912-345-6789'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                            value={newOfficial.phone}
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
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                            value={newOfficial.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-sm mb-1'>Profile Photo</label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={(e) => setNewOfficial({ ...newOfficial, profilePhoto: e.target.files[0] })}
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                        />
                    </div>


                    {/* Button Container */}
                    <div className='flex justify-end space-x-2 md:col-span-2 mt-4 pr-20'>
                        <button
                            type='button'
                            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
                            onClick={() => setShowAddForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                        >
                            Add Official
                        </button>
                    </div>

                </div>
            </form>
        )}


            {showEditForm && (
                <form className='mb-6' onSubmit={handleEditOfficial}>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Full Name</label>
                            <input
                                type='text'
                                name='fullname'
                                placeholder='e.g., Juan Dela Cruz'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newOfficial.fullname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Position</label>
                            <select
                                name='position'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                                value={newOfficial.position}
                                onChange={handleInputChange}
                                required
                            >
                                <option value='' disabled>Select Position</option>
                                <option value="Barangay Captain">Barangay Captain</option>
                                <option value="Kagawad">Barangay Councilor (Kagawad)</option>
                                <option value="SK Chairperson">Sangguniang Kabataan (SK) Chairperson</option>
                                <option value="Barangay Secretary">Barangay Secretary</option>
                                <option value="Barangay Treasure">Barangay Treasurer</option>
                                <option value="Barangay Tanod">Barangay Tanod (Peace and Order Officer)</option>
                                <option value="Barangay Health Worker(BHW)">Barangay Health Worker (BHW)</option>
                                <option value="Barangay Nutrition Scholar (BNS)">Barangay Nutrition Scholar (BNS)</option>
                                <option value="Lupon Member">Barangay Lupon Member</option>
                                <option value="BDRRMC Member">Barangay Disaster Risk Reduction and Management Council (BDRRMC) Member</option>
                            </select>
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Phone</label>
                            <input
                                type='text'
                                name='phone'
                                placeholder='e.g., 0912-345-6789'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newOfficial.phone}
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
                                value={newOfficial.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Profile Photo</label>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={(e) => setNewOfficial({ ...newOfficial, profilePhoto: e.target.files[0] })}
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80'
                            />
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <button
                            type='button'
                            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                            onClick={() => setShowEditForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                        >
                            Update Official
                        </button>
                    </div>
                </form>
            )}

            {showDeleteConfirmation && (
                <DeleteOfficialConfirmation
                    handleDeleteOfficial={handleDeleteOfficial}
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                />
            )}

            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'>
            {(searchTerm ? filteredOfficials : officials).map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg rounded-xl p-6 border border-gray-700 flex flex-col items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Profile Photo */}
                        <img
                            src={`http://localhost:5000/${item.profilePhoto}`}
                            alt="Official's Photo"
                            className="w-28 h-28 object-cover rounded-full border border-gray-500 mb-3"
                            onError={(e) => {
                                e.target.src = "http://localhost:5000/uploads/default-profile.png";
                            }}
                        />

                        {/* Official's Information */}
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-gray-400">{item.position}</h3>
                            <p className="mt-1 text-xl font-semibold text-gray-100">{item.fullname}</p>
                            <div className="mt-1 flex items-center text-sm text-gray-400 text-center">
                                <PhoneIncoming className="mr-2 text-gray-500" size={16} />
                                <span>{item.phone}</span>
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-400">
                                <Mail className="mr-2 text-gray-500" size={16} />
                                <span>{item.email}</span>
                            </div>    
                        </div>

                        {(accountType === "staff" || accountType === "admin" || accountType === "barangay captain") && (
                        <div className="mt-4 flex flex-col items-center">
                            <h3 className="text-lg font-semibold text-gray-100">QR Code</h3>
                            <img
                                src={item.qrCode} // Use the QR code URL from the backend
                                alt="QR Code"
                                className="mt-2"
                            />
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 flex items-center"
                                onClick={() => handleDownloadQR(item.qrCode, item.fullname)}
                            >
                                <Download size={18} className="mr-2" />
                                <span>Download QR Code</span>
                            </button>
                        </div>

                        )}

                        {/* Edit and Delete Buttons */}
                        {(accountType === "admin" || accountType === "barangay captain") && (
                            <div className="flex justify-end mt-4">
                                <button
                                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                                    onClick={() => handleEditClick(item)}
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    className="text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteClick(item._id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>


        </div>
    );
};

export default OfficialsList;
