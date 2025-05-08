import { motion } from "framer-motion";
import ManageRequest from "../components/request/ManageRequest";
import RequestForm from "../components/request/RequestForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/common/Header";

const ManageRequestPage = () => {
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
                // Optionally, refresh the list of requests in ManageRequest
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

    return (
        <div className="flex-1 overflow-auto">
            {/* Header */}
            <Header title="Manage Requests" />
            <motion.div
                className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mt-4 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <ToastContainer />
                <div className="relative flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-100">Request Form</h2>
                </div>
                {/* Pass handleRequestSubmit to RequestForm */}
                <RequestForm onSubmit={handleRequestSubmit} userId={1} /> {/* Replace with actual userId */}
                <div className="pt-4"> {/* Added padding at the top */}
                    <ManageRequest />
                </div>
            </motion.div>
        </div>
    );
};

export default ManageRequestPage;