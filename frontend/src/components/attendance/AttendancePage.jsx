import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from 'react-toastify';

const AttendancePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {}; // Retrieve eventId from state
    const [eventName, setEventName] = useState("");
    const [eventStatus, setEventStatus] = useState("");

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/events/${eventId}`);
                const data = await response.json();
                setEventName(data.name); // Assuming the API returns an object with a `name` property
                setEventStatus(data.status); // Assuming the API returns an object with a `status` property
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const handleDisabledClick = () => {
        toast.warn("This event is already done. You cannot record attendance anymore.");
    };

    if (!eventId) {
        return <p className="text-red-500">Invalid event. Please go back and select a valid event.</p>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white relative">
            <ToastContainer />
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                onClick={() => navigate("/events")}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>
            <h1 className="text-2xl font-bold mb-6">Attendance for {eventName || "Loading..."}</h1>
            <div className="flex space-x-4">
            <div className="relative group">
                <button
                    className={`px-4 py-2 rounded-lg ${
                        eventStatus === "Done" ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={
                        eventStatus === "Done"
                            ? handleDisabledClick
                            : () => navigate('/events/attendance/record_resident', { state: { eventId } })
                    }
                    disabled={eventStatus === "Done"}
                >
                    Record Residents Attendance
                </button>
                {eventStatus === "Done" && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-sm px-3 py-1 rounded-lg shadow-lg">
                        This event is already done. You cannot record attendance anymore.
                    </div>
                )}
            </div>
            <button
                className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => navigate(`/events/attendance/residents_attendance`, { state: { eventId } })}
            >
                View Residents Attendance
            </button>
        </div>
        <div className="flex space-x-4 mt-4">
            <div className="relative group">
                <button
                    className={`px-4 py-2 rounded-lg ${
                        eventStatus === "Done" ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                    }`}
                    onClick={
                        eventStatus === "Done"
                            ? handleDisabledClick
                            : () => navigate('/events/attendance/record_official', { state: { eventId } })
                    }
                    disabled={eventStatus === "Done"}
                >
                    Record Officials Attendance
                </button>
                {eventStatus === "Done" && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-sm px-3 py-1 rounded-lg shadow-lg">
                        This event is already done. You cannot record attendance anymore.
                    </div>
                )}
            </div>
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