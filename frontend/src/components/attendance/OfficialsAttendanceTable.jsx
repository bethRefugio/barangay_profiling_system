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
                const data = await response.json();
                setOfficials(data);
            } catch (error) {
                console.error("Error fetching officials' attendance:", error);
            }
        };

        if (eventId) {
            fetchOfficialsAttendance();
        }
    }, [eventId]);

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    return (
        <div className="p-6 bg-gray-800 text-white relative">
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                onClick={() => navigate("/events/attendance", {state: { eventId }})}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>
            <h1 className="text-2xl font-bold mb-6 mt-12 text-center">Officials Attendance for {eventName}</h1>
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
                                Time
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {officials.map((official) => (
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
                                    {new Date(official.time).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OfficialsAttendanceTable;