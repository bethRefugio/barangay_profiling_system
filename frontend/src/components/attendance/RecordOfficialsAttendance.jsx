import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { QrReader } from 'react-qr-reader';
import { ArrowLeft } from 'lucide-react';

function RecordOfficialsAttendance() {
    const location = useLocation();
    const navigate = useNavigate();
    const { eventId } = location.state || {}; // Retrieve eventId from state
    const [eventName, setEventName] = useState('');
    const [officialDetails, setOfficialDetails] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false); // Prevent duplicate scans
    const debounceRef = useRef(null); // Ref to store the debounce timer

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/events/${eventId}`);
                const data = await response.json();
                setEventName(data.name); // Update eventName state
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const handleScan = async (result, error) => {
        if (result && !scanning) {
            const officialId = result?.text?.replace('Official ID:', '').trim(); // Extract residentId from QR code
            console.log('Scanned Official ID:', officialId);

            // Debounce to prevent multiple scans
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(async () => {
                setScanning(true); // Disable further scans temporarily
                setMessage('Saving...'); // Display saving message

                try {
                    // Send residentId and eventId to the backend to fetch and record attendance
                    const response = await fetch('http://localhost:5000/attendance_officials', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ officialId, eventId }), // Include eventId in the request
                    });

                    const data = await response.json();
                    if (response.ok) {
                        setOfficialDetails(data.attendance); // Display resident details
                        setMessage('Attendance recorded successfully!');
                    } else {
                        setMessage(data.message || 'Failed to record attendance');
                    }
                } catch (err) {
                    console.error('Error recording attendance:', err);
                    setMessage('Error recording attendance');
                }

                // Re-enable scanning after 10 seconds
                setTimeout(() => {
                    setScanning(false);
                    setMessage('');
                }, 10000);
            }, 500); // Debounce time of 500ms
        }

        if (error) {
            if (error.name === 'AbortError') {
                console.warn('Camera access was interrupted. Retrying...');
                return;
            }
            console.error('QR Reader Error:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-800 text-white relative">
            {/* Back Button */}
            <button
                className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center"
                onClick={() => navigate("/events/attendance", { state: { eventId } })}
            >
                <ArrowLeft size={20} className="mr-2" />
            </button>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-6 mt-12 text-center">
                Officials Attendance for {eventName || 'Loading...'}
            </h1>

            {/* QR Scanner */}
            <center>
                <span className="text-lg font-medium mb-2">QR Scanner</span>
                <div style={{ marginTop: 2, maxWidth: '430px', maxHeight: '350px', overflow: 'hidden' }}>
                    <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: 'environment' }} // Use back camera
                        videoContainerStyle={{ width: '100%', height: '100%' }} // Ensure proper video sizing
                        style={{ width: '100%', height: '100%' }} // Fit within the container
                        scanDelay={scanning ? 10000 : 500} // Delay scanning while saving
                    />
                </div>
            </center>

            {/* Messages */}
            {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Resident Details */}
            {officialDetails && (
                <div className="p-6 bg-gray-800 text-white relative">
                    <h2 className="text-lg font-bold mb-2">Officials Details</h2>
                    <p><strong>Name:</strong> {officialDetails.fullname}</p>
                    <p><strong>Position:</strong> {officialDetails.position}</p>
                    <p><strong>Phone:</strong> {officialDetails.phone}</p>
                    <p><strong>Time:</strong> {new Date(officialDetails.time).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
}

export default RecordOfficialsAttendance;
