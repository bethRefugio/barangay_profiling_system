import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Edit, Search, Trash2, UserRoundPlus, Download, Import, ListCollapse, X } from "lucide-react";
import axios from "axios";
import Papa from "papaparse"; 
import AddResidentForm from './AddResidentForm';
import EditResidentForm from './EditResidentForm';
import DeleteResidentConfirmation from './DeleteResidentConfirmation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/resident';

const ResidentsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchColumn, setSearchColumn] = useState("");
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const residentsPerPage = 10;
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedResidentId, setSelectedResidentId] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);
    const [newResident, setNewResident] = useState({
        fullname: "",
        age: "",
        purok: "",
        gender: "",
        birthdate: "",
        email: "",
        phone: "",
        civil_status: "",
        is_pwd: "",
        is_aVoter: "",
        employment_status: "",
        income_source: "",
        educational_level: ""
    });
    const [csvResidents, setCsvResidents] = useState([]); // State for CSV content
    const [accountType, setAccountType] = useState(null);
    const [showDetails, setShowDetails] = useState(false); // State to toggle the pop-out form
    const [selectedResident, setSelectedResident] = useState(null); // State to store the selected resident details


    const fetchResidents = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            setResidents(response.data);
            setFilteredResidents(response.data);
        } catch (error) {
            console.error("Error fetching residents:", error);
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
        fetchResidents();
    }, [fetchResidents]);

    const currentResidents = filteredResidents.slice(
        (currentPage - 1) * residentsPerPage,
        currentPage * residentsPerPage
    );

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === "") {
            setFilteredResidents(residents);
            return;
        }
    
        if (!searchColumn) {
            // If no column is selected, do not filter
            setFilteredResidents(residents);
            return;
        }
    
        const filtered = residents.filter((resident) => {
            const value = resident[searchColumn];
    
            // Handle exact match for gender
            if (searchColumn === "gender") {
                return value && value.toLowerCase() === term;
            }
    
            // Handle partial match for other fields
            return value && value.toString().toLowerCase().includes(term);
        });
    
        setFilteredResidents(filtered);
    };

    const handleColumnChange = (e) => {
        setSearchColumn(e.target.value); // Update the selected column
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewResident({ ...newResident, [name]: value });
    };

    const handleAddResident = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, newResident);
            toast.success('Resident added successfully!');
            fetchResidents();
            setShowAddForm(false);
            setNewResident({
                fullname: "",
                age: "",
                purok: "",
                gender: "",
                birthdate: "",
                email: "",
                phone: "",
                civil_status: "",
                is_pwd: "",
                is_aVoter: "",
                employment_status: "",
                income_source: "",
                educational_level: ""
            });
        } catch (error) {
            console.error("Error adding resident:", error);
            toast.error('Error adding resident!');
        }
    };

    const handleEditResident = async (e) => {
        e.preventDefault();
        if (!selectedResidentId) {
            toast.error('Resident ID is missing. Cannot update resident.');
            return;
        }
        try {
            await axios.put(`${API_URL}/${selectedResidentId}`, newResident);
            toast.success('Resident updated successfully!');
            fetchResidents();
            setShowEditForm(false);
            setNewResident({
                fullname: "",
                age: "",
                purok: "",
                gender: "",
                birthdate: "",
                email: "",
                phone: "",
                civil_status: "",
                is_pwd: "",
                is_aVoter: "",
                employment_status: "",
                income_source: "",
                educational_level: ""
            });
        } catch (error) {
            console.error("Error editing resident:", error);
            toast.error('Error editing resident!');
        }
    };

    const handleEditClick = (resident) => {
        // Fix: use resident._id or resident.id instead of resident.residentId
        const id = resident._id || resident.id;
        setSelectedResidentId(id);
        setNewResident(resident);
        setShowEditForm(true);
    };

    const handleDeleteClick = (resident) => {
        // Fix: use resident._id or resident.id instead of resident.residentId
        const id = resident._id || resident.id;
        setResidentToDelete({ ...resident, id });
        setShowDeleteConfirmation(true);
    };

    const handleDeleteResident = async () => {
        if (!residentToDelete || (!residentToDelete.id && !residentToDelete._id)) {
            toast.error('Resident ID is missing. Cannot delete resident.');
            return;
        }
        try {
            const id = residentToDelete.id || residentToDelete._id;
            await axios.delete(`${API_URL}/${id}`);
            toast.success('Resident deleted!');
            fetchResidents();
            setShowDeleteConfirmation(false);
            setResidentToDelete(null);
        } catch (error) {
            console.error("Error deleting resident:", error);
            toast.error('Error deleting resident!');
        }
    };

    const downloadCSV = () => {
        if (filteredResidents.length === 0) {
            toast.warn("No data available to download.");
            return;
        }

        const csvHeaders = [
            "Full Name, Age, Purok, Gender, Birthdate, Email, Phone, Civil Status, PWD, Registered Voter, Employment Status, Income Source, Educational Level"
        ];

        const csvRows = filteredResidents.map(resident =>
            `"${resident.fullname}","${resident.age}","${resident.purok}","${resident.gender}","${resident.birthdate}","${resident.email}","${resident.phone}","${resident.civil_status}","${resident.is_pwd}","${resident.is_aVoter}","${resident.employment_status}","${resident.income_source}","${resident.educational_level}"`
        );

        const csvContent = [csvHeaders, ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "residents_list.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV file downloaded successfully!");
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setCsvResidents(results.data);
                setFilteredResidents(results.data);
                toast.info("CSV content loaded into the table. Click 'Save' to save to the database or 'Cancel' to discard.");
       
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                toast.error("Failed to parse CSV file.");
            },
        });
    };

    const saveCsvToDatabase = async () => {
        try {
            for (const resident of csvResidents) {
                await axios.post(API_URL, resident);
            }
            toast.success("CSV content saved to the database!");
            fetchResidents();
            setCsvResidents([]);
        } catch (error) {
            console.error("Error saving CSV content:", error);
            toast.error("Failed to save CSV content to the database.");
        }
    };

    const cancelCsvUpload = () => {
        setCsvResidents([]); // Clear CSV data
        fetchResidents(); // Restore the original table content
        toast.info("CSV upload canceled. Original data restored.");
    };

    const handleViewDetails = (resident) => {
        setSelectedResident(resident); // Set the selected resident
        setShowDetails(true); // Show the pop-out form
    };

    const handleCloseDetails = () => {
        setShowDetails(false); // Hide the pop-out form
        setSelectedResident(null); // Clear the selected resident
    };

    const handleDownloadQR = (qrCode, fullname) => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `${fullname}_QR_Code.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("QR Code downloaded successfully!");
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <ToastContainer />
            <div className='relative flex flex-col items-center mb-6'>
    {/* Title and Download Button */}
    <div className='flex justify-between items-center w-full'>
        <h2 className='text-xl font-semibold text-gray-100'>Resident List</h2>
        {(accountType === "admin" || accountType === "barangay captain") && (
            
        <button
            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 
                focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center'
            onClick={downloadCSV}
        >
            <Download size={18} className='mr-2' /> Download
        </button>
        )}
    </div>

    {/* Controls Section */}
    <div className='flex flex-wrap justify-center items-center space-x-4 mt-4'>
        {/* Dropdown for Column Selection */}
<div className='relative'>
    <select
        className='bg-gray-700 text-white rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none'
        value={searchColumn}
        onChange={handleColumnChange}
    >
        <option value="" disabled>
            Sort By
        </option>
        <option value="fullname">Full Name</option>
        <option value="age">Age</option>
        <option value="purok">Purok</option>
        <option value="gender">Gender</option>
        <option value="civil_status">Civil Status</option>
        <option value="birthdate">Birthdate</option>
        <option value="email">Email</option>
        <option value="phone">Phone Number</option>
        <option value="is_pwd">PWD</option>
        <option value="is_aVoter">Registered Voter</option>
        <option value="employment_status">Employment Status</option>
        <option value="income_source">Income Source</option>
        <option value="educational_level">Educational Level</option>
    </select>
    {/* Custom Dropdown Icon */}
    <div className='absolute inset-y-0 right-2 flex items-center pointer-events-none'>
        <svg
            className='w-4 h-4 text-gray-400'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
        >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
    </div>
</div>
        {/* Search Input */}
        <div className='relative flex items-center w-[350px]'>
            <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
            <input
                type='text'
                placeholder='Search residents...'
                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-12 pr-6 py-2 w-full 
                    focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={handleSearch}
                value={searchTerm}
            />
        </div>

        {/* Add Icon Button */}
        {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff" || accountType === "resident") && (
            <button
                className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center'
                onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setNewResident({
                        fullname: "",
                        age: "",
                        purok: "",
                        gender: "",
                        birthdate: "",
                        email: "",
                        phone: "",
                        civil_status: "",
                        is_pwd: "",
                        is_aVoter: "",
                        employment_status: "",
                        income_source: "",
                        educational_level: ""
                    });
                }}
            >
                <UserRoundPlus size={18} />
            </button>
        )}

        {/* Import Data Button */}
        {(accountType === "admin" || accountType === "barangay captain") && (
            <div className='relative'>
                <button
                    className='bg-blue-500 text-white px-4 py-2 w-40 rounded-lg hover:bg-blue-600 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center'
                    onClick={() => document.getElementById('csvUploadInput').click()} // Trigger file input click
                >
                    <Import size={16} className='mr-2' />
                    Import data
                </button>
                <input
                    id='csvUploadInput'
                    type='file'
                    accept='.csv'
                    onChange={handleCsvUpload}
                    className='hidden' // Hide the file input
                />
            </div>
        )}

                    {/* Save and Cancel Buttons */}
                    {csvResidents.length > 0 && (
                        <div className='flex space-x-4'>
                            <button
                                className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                                onClick={saveCsvToDatabase}
                            >
                                Save to Database
                            </button>
                            <button
                                className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500'
                                onClick={cancelCsvUpload}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {showAddForm && (
                <AddResidentForm
                    newResident={newResident}
                    handleInputChange={handleInputChange}
                    handleAddResident={handleAddResident}
                    setShowForm={setShowAddForm}
                />
            )}

            {showEditForm && (
                <EditResidentForm
                    newResident={newResident}
                    handleInputChange={handleInputChange}
                    handleEditResident={handleEditResident}
                    setShowForm={setShowEditForm}
                />
            )}

            {showDeleteConfirmation && (
                <DeleteResidentConfirmation
                    handleDeleteResident={handleDeleteResident}
                    setShowDeleteConfirmation={setShowDeleteConfirmation}
                />
            )}


           <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Full Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Age
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Purok
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Gender
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Civil Status
                            </th>
                            {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff" || accountType === "resident" || accountType === "guest") && (
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {currentResidents.map((resident) => (
                            <motion.tr
                                key={resident.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {resident.fullname}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.age}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.purok}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.gender}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.civil_status}
                                </td>
                                {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff" || accountType === "resident" || accountType === "guest") && (
                                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                        <button
                                            className='text-blue-400 hover:text-blue-300 mr-2'
                                            onClick={() => handleViewDetails(resident)}
                                        >
                                            <ListCollapse size={18} />
                                        </button>
                                        {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff") && (
                                        <button
                                            className='text-indigo-400 hover:text-indigo-300 mr-2'
                                            onClick={() => handleEditClick(resident)}
                                        >
                                            <Edit size={18} />
                                        </button>
                                        )}
                                        {(accountType === "admin" || accountType === "barangay captain") && (
                                            <button
                                                className='text-red-400 hover:text-red-300 mr-2'
                                                onClick={() => handleDeleteClick(resident)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pop-out Form for Resident Details */}
            {showDetails && selectedResident && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                <div className='absolute inset-0 backdrop-blur-sm'></div>
                    <div className='relative bg-gray-800 p-6 rounded-lg shadow-lg w-3/4 z-50'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-semibold text-gray-100'>Resident Details</h2>
                            <button
                                className='text-gray-400 hover:text-gray-300'
                                onClick={handleCloseDetails}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <p className='text-gray-400'>
                                <strong>Full Name:</strong> <span className='text-gray-200'>{selectedResident.fullname}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Age:</strong> <span className='text-gray-200'>{selectedResident.age}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Purok:</strong> <span className='text-gray-200'>{selectedResident.purok}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Gender:</strong> <span className='text-gray-200'>{selectedResident.gender}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Birthdate:</strong> <span className='text-gray-200'>{selectedResident.birthdate}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Email:</strong> <span className='text-gray-200'>{selectedResident.email}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Phone:</strong> <span className='text-gray-200'>{selectedResident.phone}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Civil Status:</strong> <span className='text-gray-200'>{selectedResident.civil_status}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>PWD:</strong> <span className='text-gray-200'>{selectedResident.is_pwd}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Registered Voter:</strong> <span className='text-gray-200'>{selectedResident.is_aVoter}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Employment Status:</strong> <span className='text-gray-200'>{selectedResident.employment_status}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Income Source:</strong> <span className='text-gray-200'>{selectedResident.income_source}</span>
                            </p>
                            <p className='text-gray-400'>
                                <strong>Educational Level:</strong> <span className='text-gray-200'>{selectedResident.educational_level}</span>
                            </p>
                        </div>
                        <div className='mt-4'>
                            <h3 className='text-lg font-semibold text-gray-100'>QR Code</h3>
                            <img src={selectedResident.qrCode} alt="QR Code" className='mt-2' />
                            <button
                                className='bg-blue-500 text-white px-4 py-2 rounded-lg mt-4'
                                onClick={() => handleDownloadQR(selectedResident.qrCode, selectedResident.fullname)}
                            >
                                <Download size={18} className='mr-2' /> Download QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className='flex justify-between items-center mb-4 mt-6'>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
                    >
                        Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredResidents.length / residentsPerPage)))}
                        disabled={currentPage === Math.ceil(filteredResidents.length / residentsPerPage)}
                        className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
                    >
                        Next
                    </button>
                </div>
        </motion.div>
    );
};

export default ResidentsTable;
