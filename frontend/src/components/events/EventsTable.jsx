import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, CalendarPlus, ClipboardList } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/events';

const EventsTable = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const navigate = useNavigate();
    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        time: "",
        location: "",
        status: "Upcoming"
    });

    const fetchEvents = useCallback(async () => {
        try {
            const response = await axios.get(API_URL);
            const updatedEvents = response.data.map(event => ({
                ...event,
                status: calculateEventStatus(event.date, event.time)
            }));
            setEvents(updatedEvents);
            setFilteredEvents(updatedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const calculateEventStatus = (date, time) => {
        const eventDateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (eventDateTime > now) {
            return "Upcoming";
        } else if (
            eventDateTime.toDateString() === now.toDateString() &&
            eventDateTime.getHours() === now.getHours() &&
            eventDateTime.getMinutes() === now.getMinutes()
        ) {
            return "On-going";
        } else {
            return "Done";
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = events.filter((event) =>
            Object.values(event).some(value =>
                typeof value === "string" && value.toLowerCase().includes(term)
            )
        );

        setFilteredEvents(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({ ...newEvent, [name]: value });
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, newEvent);
            toast.success('Event added successfully!');
            fetchEvents();
            setShowAddForm(false);
            setNewEvent({
                name: "",
                date: "",
                time: "",
                location: "",
                status: "Upcoming"
            });
        } catch (error) {
            console.error("Error adding event:", error);
            toast.error('Error adding event!');
        }
    };

    const handleEditEvent = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/${selectedEventId}`, newEvent);
            toast.success('Event updated successfully!');
            fetchEvents();
            setShowEditForm(false);
            setNewEvent({
                name: "",
                date: "",
                time: "",
                location: "",
                status: "Upcoming"
            });
        } catch (error) {
            console.error("Error updating event:", error);
            toast.error('Error updating event!');
        }
    };

    const handleEditClick = (event) => {
        setSelectedEventId(event.eventId || event._id || event.id);
        setNewEvent(event);
        setShowEditForm(true);
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteConfirmation(true);
    };

    const handleDeleteEvent = async () => {
        try {
            await axios.delete(`${API_URL}/${eventToDelete._id}`);
            toast.success('Event deleted successfully!');
            fetchEvents();
            setShowDeleteConfirmation(false);
            setEventToDelete(null);
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error('Error deleting event!');
        }
    };

    const handleGoToAttendance = (event) => {
        if (!event || !event._id) {
            console.error("Invalid event object:", event);
            toast.error("Invalid event data!");
            return;
        }
        navigate(`/events/attendance`, { state: { eventId: event._id } });
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
                <h2 className='text-xl font-semibold text-gray-100'>Events List</h2>
                <div className='relative flex items-center w-[300px]'>
                    <input
                        type='text'
                        placeholder='Search events...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 w-full 
                            focus:outline-none focus:ring-2 focus:ring-blue-500'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <button
                    className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    onClick={() => {
                        setShowAddForm(true);
                        setShowEditForm(false);
                        setNewEvent({
                            name: "",
                            date: "",
                            time: "",
                            location: "",
                            status: "Upcoming"
                        });
                    }}
                >
                    <CalendarPlus size={18} className='inline-block mr-1' /> Add Event
                </button>
            </div>

            {showAddForm && (
                <form className='mb-6' onSubmit={handleAddEvent}>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Event Name</label>
                            <input
                                type='text'
                                name='name'
                                placeholder='Event Name'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Date</label>
                            <input
                                type='date'
                                name='date'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Time</label>
                            <input
                                type='time'
                                name='time'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Location</label>
                            <input
                                type='text'
                                name='location'
                                placeholder='Location'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.location}
                                onChange={handleInputChange}
                                required
                            />
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
                            Add Event
                        </button>
                    </div>
                </form>
            )}

            {showEditForm && (
                <form className='mb-6' onSubmit={handleEditEvent}>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-2'>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Event Name</label>
                            <input
                                type='text'
                                name='name'
                                placeholder='Event Name'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Date</label>
                            <input
                                type='date'
                                name='date'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Time</label>
                            <input
                                type='time'
                                name='time'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.time}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className='flex flex-col'>
                            <label className='text-sm mb-1'>Location</label>
                            <input
                                type='text'
                                name='location'
                                placeholder='Location'
                                className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                                value={newEvent.location}
                                onChange={handleInputChange}
                                required
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
                            Update Event
                        </button>
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
                                        onClick={handleDeleteEvent}
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
                                Event Name
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Time
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Location
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
                        {filteredEvents.map((event) => (
                            <motion.tr
                                key={event.eventId || event._id || index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-100'>
                                    {event.name}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {event.date}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {event.time}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {event.location}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            event.status === "Upcoming"
                                                ? "bg-blue-800 text-blue-100"
                                                : event.status === "On-going"
                                                ? "bg-green-800 text-green-100"
                                                : "bg-gray-800 text-red-100"
                                        }`}
                                    >
                                        {event.status}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <div className='flex flex-col space-y-2'> {/* Flex column with spacing */}
                                        <button
                                            className='text-yellow-400 hover:text-yellow-300 flex items-center space-x-1' 
                                            onClick={() => handleGoToAttendance(event)}
                                        >
                                            <ClipboardList size={18} />
                                            <span>Go to Attendance</span>
                                        </button>
                                        <button
                                            className='text-indigo-400 hover:text-indigo-300 flex items-center space-x-1' 
                                            onClick={() => handleEditClick(event)}
                                        > 
                                            <Edit size={18} />
                                            <span>Edit Event</span>
                                        </button>
                                        <button
                                            className='text-red-400 hover:text-red-300 flex items-center space-x-1' 
                                            onClick={() => handleDeleteClick(event)}
                                        >
                                            <Trash2 size={18} />
                                            <span>Delete Event</span>
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default EventsTable;