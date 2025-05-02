import React, { useState } from 'react';
import { toast } from 'react-toastify';

const EditAnnouncement = ({ announcement, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: announcement.title,
        content: announcement.content,
        time: announcement.time || '',
        date: announcement.date || '',
        place: announcement.place || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/announcements/${announcement._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedAnnouncement = await response.json();
                onUpdate(updatedAnnouncement);
                toast.success('Announcement updated successfully!');
                onClose();
            } else {
                toast.error('Failed to update announcement. Please try again.');
            }
        } catch (error) {
            console.error('Error updating announcement:', error);
            toast.error('An error occurred while updating the announcement.');
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Edit Announcement</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-gray-400">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="text-gray-400">Content</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="text-gray-400">Time (Optional)</label>
                    <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="text-gray-400">Date (Optional)</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div className="mb-4">
                    <label className="text-gray-400">Place (Optional)</label>
                    <input
                        type="text"
                        name="place"
                        value={formData.place}
                        onChange={handleChange}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAnnouncement;