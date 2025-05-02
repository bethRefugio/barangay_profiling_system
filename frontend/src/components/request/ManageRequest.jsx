import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListCollapse, CheckCircle, XCircle, FileText } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import generateBarangayClearance from "./brgy_clearance";
import generateBarangayCertificate from "./brgy_certificate";
import generateBarangayCertificateOfIndigency from "./indigency_clearance";


const API_URL = "http://localhost:5000/request";

const ManageRequest = ({ accountType }) => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [editableRequest, setEditableRequest] = useState(null);

    const fetchRequests = async () => {
        try {
            const response = await axios.get(API_URL);
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Error fetching requests!");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setEditableRequest({ ...request }); // Create a copy for editing
        setShowDetails(true);
    };

    const handleConfirmRequest = async (requestId) => {
        try {
            await axios.put(`${API_URL}/${requestId}`, { status: "Confirmed" });
            toast.success("Request confirmed!");
            fetchRequests();
        } catch (error) {
            console.error("Error confirming request:", error);
            toast.error("Error confirming request!");
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await axios.put(`${API_URL}/${requestId}`, { status: "Rejected" });
            toast.success("Request rejected!");
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Error rejecting request!");
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditableRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            await axios.put(`${API_URL}/${editableRequest._id}`, editableRequest);
            toast.success("Request updated successfully!");
            setShowDetails(false);
            fetchRequests();
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error("Error updating request!");
        }
    };

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <ToastContainer />
            <div className="relative flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-100">List of Requests</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Document Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Request Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map((request) => (
                            <motion.tr
                                key={request.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {request.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {request.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {request.documentType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {new Date(request.dateOfRequest).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            request.status === "Confirmed"
                                                ? "bg-green-800 text-green-100"
                                                : request.status === "Rejected"
                                                ? "bg-red-800 text-red-100"
                                                : request.status === "Cancelled"
                                                ? "bg-red-800 text-red-100"
                                                : "bg-orange-800 text-orange-100"
                                        }`}
                                    >
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <button
                                        className="text-blue-400 hover:text-blue-300 mr-2 flex items-center justify-center"
                                        onClick={() => handleViewDetails(request)}
                                    >
                                        <ListCollapse size={18} className="mr-1" />
                                        <span>View Details</span>
                                    </button>
                                    {request.status === "Pending" && (
                                        <>
                                            <button
                                                className="text-green-400 hover:text-green-300 mr-2 flex items-center justify-center"
                                                onClick={() => handleConfirmRequest(request._id)}
                                            >
                                                <CheckCircle size={18} className="mr-1" />
                                                <span>Confirm</span>
                                            </button>
                                            <button
                                                className="text-red-400 hover:text-red-300 mr-2 flex items-center justify-center"
                                                onClick={() => handleRejectRequest(request._id)}
                                            >
                                                <XCircle size={18} className="mr-1" />
                                                <span>Reject</span>
                                            </button>
                                        </>
                                    )}
                                    {request.status === "Confirmed" && (
                                        <button
                                            className="text-blue-400 hover:text-blue-300 mr-2 flex items-center justify-center"
                                            onClick={() => {
                                                if (request.documentType === "Barangay Clearance") {
                                                    generateBarangayClearance(request);
                                                } else if (request.documentType === "Barangay Certificate") {
                                                    generateBarangayCertificate(request);
                                                } else if (request.documentType === "Indigency Certificate") {
                                                    generateBarangayCertificateOfIndigency(request);
                                                }
                                            }}
                                        >
                                            <FileText size={18} className="mr-1" />
                                            <span>Generate PDF</span>
                                        </button>
                                    )}
                                </td>
                                                                
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showDetails && editableRequest && (
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
                                    value={editableRequest.name}
                                    onChange={handleEditChange}
                                    disabled={editableRequest.status === "Cancelled"}
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={editableRequest.address}
                                    onChange={handleEditChange}
                                    disabled={editableRequest.status === "Cancelled"}
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400">Document Type</label>
                                <select
                                    name="documentType"
                                    value={editableRequest.documentType}
                                    onChange={handleEditChange}
                                    disabled={editableRequest.status === "Cancelled"}
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
                                    value={editableRequest.purpose}
                                    onChange={handleEditChange}
                                    disabled={editableRequest.status === "Cancelled"}
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400">Status</label>
                                <select
                                    name="status"
                                    value={editableRequest.status}
                                    onChange={handleEditChange}
                                    disabled
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400">Request Date</label>
                                <input
                                    type="text"
                                    value={new Date(editableRequest.dateOfRequest).toLocaleDateString()}
                                    disabled
                                    className="bg-gray-700 text-white rounded-lg px-4 py-2 w-full"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            {editableRequest.status !== "Cancelled" && (
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 mr-2"
                                    onClick={handleSaveChanges}
                                >
                                    Save Changes
                                </button>
                            )}
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                onClick={() => setShowDetails(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ManageRequest;