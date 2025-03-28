import { useState } from "react";

const RequestForm = ({ onSubmit, userId }) => {
    console.log("Current userId:", userId); // Debugging log
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        address: "",
        documentType: "",
        purpose: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const requestData = {
            ...formData,
            dateOfRequest: new Date().toISOString(),
            status: "Pending",
            userId, // Include the userId
        };
        onSubmit(requestData);
        setFormData({
            name: "",
            age: "",
            address: "",
            documentType: "",
            purpose: "",
        });
    };

    return (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Age</label>
                <input
                    type="number"
                    name="age"
                    placeholder="Enter your age"
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Address</label>
                <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Type of Document</label>
                <select
                    name="documentType"
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    required
                >
                    <option value="" disabled>
                        Select document type
                    </option>
                    <option value="Barangay Clearance">Barangay Clearance</option>
                    <option value="Barangay Certificate">Barangay Certificate</option>
                    <option value="Indigency Certificate">Indigency Certificate</option>
                </select>
            </div>
            <div className="flex flex-col md:col-span-2">
                <label className="text-sm mb-1 text-gray-300">Purpose</label>
                <textarea
                    name="purpose"
                    placeholder="Enter the purpose of the document"
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="flex justify-end md:col-span-2">
                <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Submit Request
                </button>
            </div>
        </form>
    );
};

export default RequestForm;