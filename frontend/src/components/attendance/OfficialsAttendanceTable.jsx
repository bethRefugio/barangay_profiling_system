import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OfficialsAttendanceTable = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {};
    const [officials, setOfficials] = useState([]);
    const [eventName, setEventName] = useState("");
    const [filteredOfficials, setFilteredOfficials] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

        useEffect(() => {
            const fetchEventDetails = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/events/${eventId}`);
                    const data = await response.json();
                    setEventName(data.name); // Assuming the API returns an object with a `name` property
                } catch (error) {
                    console.error("Error fetching event details:", error);
                }
            };
    
            if (eventId) {
                fetchEventDetails();
            }
        }, [eventId]);

    useEffect(() => {
        const fetchOfficialsAttendance = async () => {
            try {
                const response = await fetch(`http://localhost:5000/officials_attendance`);
                if (!response.ok) {
                    throw new Error("Failed to fetch officials' attendance");
                }
                const data = await response.json();
                if(Array.isArray(data)) {
                    setOfficials(data);
                    setFilteredOfficials(data); // Initialize filtered officials with all officials
                } else {
                    console.error("Unexpected data format:", data);
                    setOfficials([]); 
                    setFilteredOfficials([]); 
                }
            } catch (error) {
                console.error("Error fetching officials' attendance:", error);
                setOfficials([]);
                setFilteredOfficials([]);            }
        };

        if (eventId) {
            fetchOfficialsAttendance();
        }
    }, [eventId]);

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = officials.filter((official) =>
            Object.keys(official).some((key) => {
            const value = official[key];

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

        setFilteredOfficials(filtered);
    };

    
    
        const handleDeleteClick = (attendanceId) => {
            setRecordToDelete(attendanceId);
            setShowDeleteConfirmation(true);
        };
    
        const confirmDelete = async () => {
            try {
                console.log("Deleting attendance record with ID:", recordToDelete); // Debugging log
                const response = await fetch(`http://localhost:5000/officials_attendance/${recordToDelete}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error("Failed to delete attendance record");
                }
                toast.success("Attendance record deleted successfully!");
                setOfficials((prevOfficials) =>
                    prevOfficials.filter((official) => official._id !== recordToDelete)
                );
            } catch (error) {
                console.error("Error deleting attendance record:", error);
                toast.error("Failed to delete attendance record.");
            } finally {
                setShowDeleteConfirmation(false);
                setRecordToDelete(null);
            }
        };

    return (
        <div className="p-6 bg-gray-800 text-white relative">
            <ToastContainer />
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                onClick={() => navigate("/events/attendance", {state: { eventId }})}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>
            <h1 className="text-2xl font-bold mb-6 mt-12 text-center">Officials Attendance for {eventName}</h1>
            
            <div className="relative flex items-center justify-between mb-6">
                <div className="relative flex items-center justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search official..."
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() =>
                            navigate("/events/attendance/record_official", { state: { eventId } })
                        }
                    >
                        Record Attendance
                    </button>
                </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Official Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Phone Number
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
                        {filteredOfficials.length > 0 ? (
                            filteredOfficials.map((official) => {
                                const date = new Date(official.time).toLocaleDateString(); // Extract date
                                const time = new Date(official.time).toLocaleTimeString(); // Extract time                               
                                return (
                                    <tr key={official._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                                            {official.fullname}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {official.position}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {official.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {time}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <button
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => handleDeleteClick(official._id)}
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

export default OfficialsAttendanceTable;