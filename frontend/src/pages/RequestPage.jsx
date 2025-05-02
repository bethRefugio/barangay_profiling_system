import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import RequestForm from "../components/request/RequestForm";
import RequestedTable from "../components/request/RequestedTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/common/Header";
import { XCircle } from "lucide-react";

const RequestPage = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const userId = sessionStorage.getItem("userId"); // Retrieve userId from sessionStorage

    const fetchUserRequests = async () => {
        try {
            const response = await fetch(`http://localhost:5000/request/user/${userId}`);
            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching user requests:", error);
        }
    };

    useEffect(() => {
        fetchUserRequests();
    }, []);

    const handleRequestSubmit = async (requestData) => {
        try {
            const response = await fetch("http://localhost:5000/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                toast.success("Request submitted successfully!");
                fetchUserRequests(); // Refresh the list of requests
            } else {
                const errorData = await response.json();
                console.error("Error submitting request:", errorData);
                toast.error("Failed to submit request.");
            }
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("An error occurred while submitting the request.");
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetails(true);
    };

    const handleCancelRequest = async (request) => {
        setSelectedRequest(request);
        setShowCancelConfirmation(true);
    };

    const confirmCancelRequest = async () => {
        try {
            await fetch(`http://localhost:5000/request/${selectedRequest._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...selectedRequest, status: "Cancelled" }),
            });
            toast.success("Request cancelled successfully!");
            setShowCancelConfirmation(false);
            setShowDetails(false);
            fetchUserRequests();
        } catch (error) {
            console.error("Error cancelling request:", error);
            toast.error("Failed to cancel request.");
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const { _id, status, dateOfRequest, ...editableFields } = selectedRequest; // Exclude non-editable fields
            await fetch(`http://localhost:5000/request/${_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editableFields),
            });
            toast.success("Request updated successfully!");
            setShowDetails(false);
            fetchUserRequests();
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error("Failed to update request.");
        }
    };

    return (
        <div className="flex-1 overflow-auto">
            <Header title="Request Document" />
            <motion.div
                className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <ToastContainer />
                <div className="relative flex items-center justify-between mb-6 max-w-7xl mx-auto">
                    <h2 className="text-xl font-semibold text-gray-100">Request Form</h2>
                </div>
                <RequestForm onSubmit={handleRequestSubmit} userId={userId} />
            

            <div className="mt-10">
                <RequestedTable
                    requests={requests}
                    onViewDetails={handleViewDetails}
                    onCancelRequest={handleCancelRequest}
                />
            </div>
            </motion.div>

            {showDetails && selectedRequest && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-3/4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">Edit Request</h2>
                <button
                    className="text-gray-400 hover:text-gray-300"
                    onClick={() => setShowDetails(false)}
                >
                    <XCircle size={24} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-gray-400">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={selectedRequest.name}
                        onChange={handleEditChange}
                        disabled={selectedRequest.status === "Cancelled"}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="text-gray-400">Age</label>
                    <input
                        type="text"
                        name="age"
                        value={selectedRequest.age}
                        onChange={handleEditChange}
                        disabled={selectedRequest.status === "Cancelled"}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="text-gray-400">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={selectedRequest.address}
                        onChange={handleEditChange}
                        disabled={selectedRequest.status === "Cancelled"}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="text-gray-400">Document Type</label>
                    <select
                        name="documentType"
                        value={selectedRequest.documentType}
                        onChange={handleEditChange}
                        disabled={selectedRequest.status === "Cancelled"}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    >
                        <option value="" disabled>
                            Select document type
                        </option>
                        <option value="Barangay Clearance">Barangay Clearance</option>
                        <option value="Barangay Certificate">Barangay Certificate</option>
                        <option value="Indigency Certificate">Indigency Certificate</option>
                    </select>
                </div>
                <div>
                    <label className="text-gray-400">Purpose</label>
                    <textarea
                        name="purpose"
                        value={selectedRequest.purpose}
                        onChange={handleEditChange}
                        disabled={selectedRequest.status === "Cancelled"}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="text-gray-400">Status</label>
                    <input
                        type="text"
                        name="status"
                        value={selectedRequest.status}
                        disabled
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
                <div>
                    <label className="text-gray-400">Request Date</label>
                    <input
                        type="text"
                        value={new Date(selectedRequest.dateOfRequest).toLocaleDateString()}
                        disabled
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                    />
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    onClick={() => setShowDetails(false)}
                >
                    Close
                </button>
                {selectedRequest.status !== "Cancelled" && selectedRequest.status !== "Confirmed" &&(
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-2"
                        onClick={handleSaveChanges}
                    >
                        Save Changes
                    </button>
                )}
            </div>
        </div>
    </div>
)}

            {showCancelConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            Are you sure you want to cancel this request?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2"
                                onClick={confirmCancelRequest}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                onClick={() => setShowCancelConfirmation(false)}
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

export default RequestPage;