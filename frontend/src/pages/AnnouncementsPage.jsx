import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../components/common/Header";
import CreateAnnouncement from '../components/announcements/CreateAnnouncement';
import EditAnnouncement from '../components/announcements/EditAnnouncement';
import AnnouncementsList from '../components/announcements/AnnouncementsList';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [accountType, setAccountType] = useState(null);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('http://localhost:5000/announcements');
            const data = await response.json();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId'); // Get userId from sessionStorage
                if (!userId) {
                    throw new Error('User ID not found in session storage');
                }
                console.log(`Fetching user data for userId: ${userId}`);
                const response = await axios.get(`http://localhost:5000/user/${userId}`, { withCredentials: true });
                const fetchedAccountType = response.data.accountType.toLowerCase();
                setAccountType(fetchedAccountType);
                console.log(`Fetched accountType: ${fetchedAccountType}`);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
        fetchAnnouncements();
    }, []);

    const handleAddAnnouncement = async (newAnnouncement) => {
        setAnnouncements((prev) => [...prev, newAnnouncement]);
        toast.success('Announcement created successfully!');
    };

    const handleUpdateAnnouncement = async (updatedAnnouncement) => {
        setAnnouncements((prev) =>
            prev.map((announcement) =>
                announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
            )
        );
        toast.success('Announcement updated successfully!');
        setEditingAnnouncement(null);
    };

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title='Announcements' />

            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
            
                {/* Add Announcement Button */}
                {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff") && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <PlusCircle className="mr-2 w-5 h-5" /> Add Announcement
                        </button>
                    </div>
                )}

                {showCreateForm && (
                    <CreateAnnouncement
                        onClose={() => setShowCreateForm(false)}
                        onAdd={handleAddAnnouncement}
                    />
                )}

                {editingAnnouncement && (
                    <EditAnnouncement
                        announcement={editingAnnouncement}
                        onClose={() => setEditingAnnouncement(null)}
                        onUpdate={handleUpdateAnnouncement}
                    />
                )}

                <ToastContainer />
                <AnnouncementsList
                    announcements={announcements}
                    onUpdate={fetchAnnouncements}
                    onEdit={setEditingAnnouncement}
                    accountType={accountType} // Pass accountType to AnnouncementsList
                />
            </main>
        </div>
    );
};

export default AnnouncementsPage;