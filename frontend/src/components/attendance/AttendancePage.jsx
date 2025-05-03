import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const AttendancePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {}; // Retrieve eventId from state
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

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white relative">
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                onClick={() => navigate("/events")}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>
            <h1 className="text-2xl font-bold mb-6">Attendance for {eventName || "Loading..."}</h1>
            <div className="flex space-x-4">
                <button
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => navigate('/events/attendance/record_resident', { state: { eventId } })} // Pass eventId to RecordResidentAttendance
                >
                    Record Residents Attendance
                </button>
                <button
                    className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => navigate(`/events/attendance/residents_attendance`, { state: { eventId } })}
                >
                    View Residents Attendance
                </button>
            </div>
            <div className="flex space-x-4 mt-4">
                <button
                    className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                    onClick={() => navigate('/events/attendance/record_official', { state: { eventId } })} // Pass eventId to RecordResidentAttendance
                >
                    Record Officials Attendance
                </button>
                <button
                    className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                    onClick={() => navigate(`/events/attendance/officials_attendance`, { state: { eventId } })}
                >
                    View Officials Attendance
                </button>
            </div>
        </div>
    );
};

export default AttendancePage;