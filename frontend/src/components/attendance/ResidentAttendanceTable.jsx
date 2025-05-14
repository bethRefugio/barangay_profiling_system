import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResidentAttendanceTable = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {};
    const [residents, setResidents] = useState([]);
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [eventName, setEventName] = useState("");
    const [eventStatus, setEventStatus] = useState(""); // New state for event status
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/events/${eventId}`);
                const data = await response.json();
                setEventName(data.name); // Assuming the API returns an object with a `name` property
                setEventStatus(data.status || ""); // Set event status
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    useEffect(() => {
        const fetchResidentsAttendance = async () => {
            try {
                // Fetch attendance filtered by eventId if supported by backend API
                const response = await fetch(`http://localhost:5000/residents_attendance?eventId=${eventId}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Filter client-side as fallback if backend does not filter
                    const filteredData = data.filter(record => record.eventId === eventId);
                    setResidents(filteredData);
                    setFilteredResidents(filteredData); // Initialize filtered residents
                } else {
                    console.error("Invalid data format:", data);
                    setResidents([]);
                    setFilteredResidents([]);
                }
            } catch (error) {
                console.error("Error fetching residents' attendance:", error);
                setResidents([]);
                setFilteredResidents([]);
            }
        };

        if (eventId) {
            fetchResidentsAttendance();
        }
    }, [eventId]);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = residents.filter((resident) =>
            Object.keys(resident).some((key) => {
            const value = resident[key];

            if(key === "time") {
                const date = new Date(value).toLocaleDateString().toLowerCase();
                const time = new Date(value).toLocaleTimeString().toLowerCase();
                return date.includes(term) || time.includes(term);
            }
            
            if (typeof value === "string") {
                if (key === "gender") {
                    return value.toLowerCase() === term;
                }
                return value.toLowerCase().includes(term);
            } else if (typeof value === "number") {
                return value.toString().includes(term); // Convert number to string for comparison
            }
            return false;
            })
        );

        setFilteredResidents(filtered);
    };


    const handleDeleteClick = (attendanceId) => {
        setRecordToDelete(attendanceId);
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = async () => {
        try {
            console.log("Deleting attendance record with ID:", recordToDelete); // Debugging log
            const response = await fetch(`http://localhost:5000/residents_attendance/${recordToDelete}`, {
                method: "DELETE",
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error deleting attendance record:", errorData.message);
                throw new Error(errorData.message || "Failed to delete attendance record");
            }
    
            toast.success("Attendance record deleted successfully!");
            setResidents((prevResidents) =>
                prevResidents.filter((resident) => resident._id !== recordToDelete)
            );
        } catch (error) {
            console.error("Error deleting attendance record:", error);
            toast.error(error.message || "Failed to delete attendance record.");
        } finally {
            setShowDeleteConfirmation(false);
            setRecordToDelete(null);
        }
    };

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    return (
        <div className="p-6 bg-gray-800 text-white relative">
            <ToastContainer />
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => navigate("/events/attendance", { state: { eventId } })}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>

            <h1 className="text-2xl font-bold mb-6 mt-12 text-center">
                Residents Attendance for {eventName}
            </h1>

            <div className="relative flex items-center justify-between mb-6">
                <div className="relative flex items-center justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search residents..."
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                    <button
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            eventStatus === "Done" ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                        }`}
                        onClick={() =>
                            navigate("/events/attendance/record_resident", { state: { eventId } })
                        }
                        disabled={eventStatus === "Done"}
                    >
                        Record Attendance
                    </button>
                </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Resident Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Age
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Gender
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Purok
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredResidents.length > 0 ? (
                            filteredResidents.map((resident) => {
                                 const date = new Date(resident.time).toLocaleDateString(); // Extract date
                                const time = new Date(resident.time).toLocaleTimeString(); // Extract time
                                return (
                                    <tr key={resident._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {resident.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {resident.age}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {resident.gender}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {resident.purok}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <button
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => handleDeleteClick(resident._id)}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                            );
                        })
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="px-6 py-4 text-center text-sm text-gray-400"
                                >
                                    No attendance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                        <p className="text-white mb-4">Are you sure you want to delete this record?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                onClick={confirmDelete}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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

export default ResidentAttendanceTable;