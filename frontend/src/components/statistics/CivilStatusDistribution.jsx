import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from "recharts";
import { Download } from "lucide-react"; // Using Download icon from lucide-react
import html2canvas from "html2canvas";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-gray-800 p-2 rounded shadow-lg">
                <p className="label text-white">{`Status: ${label}`}</p>
                <p className="intro text-white">{`No. of Residents: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CivilStatusDistribution = () => {
    const [statusData, setStatusData] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await fetch('http://localhost:5000/resident');
                const residents = await response.json();

                const statusGroups = {
                    'single': 0,
                    'married': 0,
                    'widowed': 0,
                    'divorced': 0,
                };

                residents.forEach(resident => {
                    const status = resident.civil_status.toLowerCase();
                    if (statusGroups[status] !== undefined) {
                        statusGroups[status]++;
                    }
                });

                const statusData = Object.keys(statusGroups).map(status => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
                    value: statusGroups[status],
                }));

                console.log('Fetched status data:', statusData); // Debugging line

                setStatusData(statusData);
            } catch (error) {
                console.error('Error fetching residents:', error);
            }
        };

        fetchResidents();
    }, []);

    // Function to download chart as PNG
    const downloadChart = async () => {
        if (chartRef.current) {
            html2canvas(chartRef.current, { backgroundColor: "#1F2937" }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "civil_status_distribution.png";
                link.click();
            });
        }
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className='text-xl font-semibold text-gray-100'>Civil Status Distribution</h2>
                <button 
                    onClick={downloadChart} 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="mr-2 w-5 h-5" /> Download
                </button>
            </div>

            <div ref={chartRef} className="bg-gray-900 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                        <XAxis dataKey="name">
                            <Label value="Civil Status" offset={-5} position="insideBottom" fill="#ffffff" />
                        </XAxis>
                        <YAxis allowDecimals={false}>
                            <Label value="No. of Residents" angle={-90} position="insideLeft" fill="#ffffff" />
                        </YAxis>
                        <Tooltip
                            content={<CustomTooltip />}
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default CivilStatusDistribution;
