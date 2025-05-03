import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResidentAttendanceTable = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {};
    const [residents, setResidents] = useState([]);
    const [eventName, setEventName] = useState("");
    const [selectedAttendanceId, setSelectedAttedanceId] = useState(null);
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
        const fetchResidentsAttendance = async () => {
            try {
                const response = await fetch(`http://localhost:5000/residents_attendance`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                if(Array.isArray(data)) {
                    setResidents(data);
                } else {
                    console.error("Invalid data format:", data);
                    setResidents([]); // Reset residents if data format is invalid
                }
            } catch (error) {
                console.error("Error fetching residents' attendance:", error);
                setResidents([]); // Reset residents on error
            }
        };

        if (eventId) {
            fetchResidentsAttendance();
        }
    }, [eventId]);

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    //const handleDeleteClick = (Attendance)

    return (
        <div className="p-6 bg-gray-800 text-white relative">
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => navigate("/events/attendance", { state: { eventId } })}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>
            
            <h1 className="text-2xl font-bold mb-6 mt-12 text-center">Residents Attendance for {eventName}</h1>
            <div className="flex justify-end">
                <button
                    className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 mt-4 "
                    onClick={() => navigate('/events/attendance/record_resident', { state: { eventId } })}
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
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                    {residents.length > 0 ? (
                            residents.map((resident) => (
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
                                        {new Date(resident.time).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-400">
                                    No attendance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResidentAttendanceTable;