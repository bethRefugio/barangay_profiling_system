import React from "react";
import { motion } from "framer-motion";
import { ListCollapse, XCircle, FileText } from "lucide-react";
import generateBarangayClearance from "./brgy_clearance";
import generateBarangayCertificate from "./brgy_certificate";
import generateBarangayCertificateOfIndigency from "./indigency_clearance";
import { toast } from "react-toastify";

const RequestedTable = ({ requests, onViewDetails, onCancelRequest }) => {
    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="overflow-x-auto">
            <div className="relative flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-100">Requested Documents</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Document Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Purpose
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Request Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {requests.map((request) => (
                            <motion.tr
                                key={request._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                                {request.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-100">{request.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{request.documentType}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">{request.purpose}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            request.status === "Pending"
                                                ? "bg-yellow-800 text-yellow-100"
                                                : request.status === "Confirmed"
                                                ? "bg-green-800 text-green-100"
                                                : "bg-red-800 text-red-100"
                                        }`}
                                    >
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">
                                        {new Date(request.dateOfRequest).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <button
                                        className="text-blue-400 hover:text-blue-300 mr-2 flex items-center justify-center"
                                        onClick={() => onViewDetails(request)}
                                    >
                                        <ListCollapse size={18} className="mr-1" />
                                        <span>View Details</span>
                                    </button>
                                    {request.status !== "Confirmed" && request.status !== "Cancelled" && (
                                        <button
                                            className="text-red-400 hover:text-red-300 flex items-center justify-center"
                                            onClick={() => onCancelRequest(request)}
                                        >
                                            <XCircle size={18} className="mr-1" />
                                            <span>Cancel Request</span>
                                        </button>
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
                                                } else {
                                                    toast.error("Invalid document type!");
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
        </motion.div>
    );
};

export default RequestedTable;