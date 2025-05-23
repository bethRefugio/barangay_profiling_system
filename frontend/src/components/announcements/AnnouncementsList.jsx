import React, { useState } from 'react';
import { Edit, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const AnnouncementsList = ({ announcements, onUpdate, onEdit, accountType }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

    // Helper function to convert 24-hour time string to 12-hour format with AM/PM
    const formatTime12Hour = (time24) => {
        if (!time24) return "";
        const [hourStr, minute] = time24.split(":");
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minute} ${ampm}`;
    };

    const handleDelete = async () => {
        try {
            await fetch(`http://localhost:5000/announcements/${selectedAnnouncementId}`, { method: 'DELETE' });
            toast.success('Announcement deleted successfully!');
            onUpdate();
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error('Failed to delete announcement. Please try again.');
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {announcements.map((announcement) => (
                <div
                    key={announcement.id}
                    className="flex bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
                >
                    <div className="w-1/4 flex items-center justify-center">
                        <img
                            src="/announcement.png"
                            alt="Announcement"
                            className="w-16 h-16 object-contain"
                        />
                    </div>

                    <div className="w-3/4 flex flex-col">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-100 mb-2">{announcement.title}</h2>
                            <p className="text-gray-300 mb-2">{announcement.content}</p>
                            {announcement.date && <p className="text-gray-400 mb-1">Date: {announcement.date}</p>}
                            {announcement.time && <p className="text-gray-400 mb-1">Time: {formatTime12Hour(announcement.time)}</p>}
                            {announcement.place && <p className="text-gray-400 mb-1">Place: {announcement.place}</p>}
                        </div>
                        {(accountType === "admin" || accountType === "barangay captain" || accountType === "staff") && (
                            <div className="flex justify-end mt-3 space-x-2">
                                <button
                                    className="text-blue-500 hover:text-blue-400"
                                    onClick={() => onEdit(announcement)}
                                >
                                    <Edit className="w-6 h-6" />
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-400"
                                    onClick={() => {
                                        setSelectedAnnouncementId(announcement._id);
                                        setShowDeleteConfirmation(true);
                                    }}
                                >
                                    <Trash className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            Are you sure you want to delete this announcement?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                                onClick={handleDelete}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                onClick={() => setShowDeleteConfirmation(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsList;