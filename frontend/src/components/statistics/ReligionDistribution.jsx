import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react"; // Using Download icon from lucide-react
import html2canvas from "html2canvas";

const ReligionDistribution = () => {
    const [religionData, setReligionData] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await fetch("http://localhost:5000/resident");
                const residents = await response.json();

                const religionGroups = {
                    "Roman Catholic": 0,
                    "Islam": 0,
                    "Iglesia ni Cristo": 0,
                    "Seventh Day Adventist": 0,
                    "Others": 0,
                };

                // Correctly access the `religion` field
                residents.forEach((resident) => {
                    const religion = resident.religion; // Use the correct field name
                    if (religionGroups[religion] !== undefined) {
                        religionGroups[religion]++;
                    } else {
                        religionGroups["Others"]++; // Count any undefined or unexpected values as "Others"
                    }
                });

                const religionData = Object.keys(religionGroups).map((group) => ({
                    name: group,
                    value: religionGroups[group],
                }));

                setReligionData(religionData);
            } catch (error) {
                console.error("Error fetching residents:", error);
            }
        };

        fetchResidents();
    }, []);

    // Function to download chart as PNG
    const downloadChart = async () => {
        if (chartRef.current) {
            const canvas = await html2canvas(chartRef.current);
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "religion_distribution.png";
            link.click();
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
                <h2 className="text-lg font-semibold text-gray-200">Religion Distribution</h2>
                <button 
                    onClick={downloadChart} 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="mr-2 w-5 h-5" /> Download
                </button>
            </div>

            <div ref={chartRef} className="h-[500px] bg-gray-900 p-4 rounded-lg"> 
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={religionData} margin={{ top: 10, right: 30, left: 50, bottom: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke='#4B5563' />

                        <XAxis 
                            dataKey="name" 
                            stroke='#9ca3af' 
                            angle={-30} 
                            textAnchor="end" 
                            interval={0} 
                            tick={{ fontSize: 11 }}
                            label={{
                                value: "Religion",
                                position: "bottom",
                                offset: 80,
                                fill: "#ffffff",
                                fontSize: 14
                            }}
                        />

                        <YAxis 
                            stroke='#9ca3af' 
                            tick={{ fontSize: 12 }}
                            label={{
                                value: "No. of Residents",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#ffffff",
                                fontSize: 14
                            }}
                        />
                        
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Bar dataKey="value" fill="#6366F1" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ReligionDistribution;