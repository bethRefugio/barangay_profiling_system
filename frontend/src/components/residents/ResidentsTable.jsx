import React, { useState, useEffect, useCallback } from 'react';
import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus } from "lucide-react";
import axios from "axios";
import AddResidentForm from './AddResidentForm';
import EditResidentForm from './EditResidentForm';
import DeleteResidentConfirmation from './DeleteResidentConfirmation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/resident';

const ResidentsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
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
        is_senior: "",
        employment_status: "",
        income_source: "",
        educational_level: ""
    });

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
        fetchResidents();
    }, [fetchResidents]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = residents.filter(
            (resident) => resident.fullname.toLowerCase().includes(term) || resident.purok.toLowerCase().includes(term)
        );

        setFilteredResidents(filtered);
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
                is_senior: "",
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
                is_senior: "",
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
        setSelectedResidentId(resident.residentId);
        setNewResident(resident);
        setShowEditForm(true);
    };

    const handleDeleteClick = (resident) => {
        setResidentToDelete(resident);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteResident = async () => {
        try {
            await axios.delete(`${API_URL}/${residentToDelete.residentId}`);
            toast.success('Resident deleted!');
            fetchResidents();
            setShowDeleteConfirmation(false);
            setResidentToDelete(null);
        } catch (error) {
            console.error("Error deleting resident:", error);
            toast.error('Error deleting resident!');
        }
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <ToastContainer />
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Resident List</h2>
                <div className='relative flex items-center'>
                    <input
                        type='text'
                        placeholder='Search residents...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                    <button
                        className='ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
                                is_senior: "",
                                employment_status: "",
                                income_source: "",
                                educational_level: ""
                            });
                        }}
                    >
                        <Plus size={18} />
                    </button>
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
                                Birthdate
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Email
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Phone
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Civil Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                PWD
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Senior
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Employment Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Income Source
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Educational Level
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredResidents.map((resident) => (
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
                                    {resident.birthdate}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.email}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.phone}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.civil_status}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.is_pwd}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.is_senior}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.employment_status}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.income_source}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {resident.educational_level}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button
                                        className='text-indigo-400 hover:text-indigo-300 mr-2'
                                        onClick={() => handleEditClick(resident)}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className='text-red-400 hover:text-red-300'
                                        onClick={() => handleDeleteClick(resident)}
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

export default ResidentsTable;