import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react"; // Using Download icon from lucide-react
import html2canvas from "html2canvas";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const AgeDistribution = () => {
    const [ageData, setAgeData] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await fetch('http://localhost:5000/resident');
                const residents = await response.json();

                const ageGroups = {
                    '0-18': 0,
                    '19-35': 0,
                    '36-50': 0,
                    '51-65': 0,
                    '66+': 0,
                };

                residents.forEach(resident => {
                    const age = resident.age;
                    if (age <= 18) ageGroups['0-18']++;
                    else if (age <= 35) ageGroups['19-35']++;
                    else if (age <= 50) ageGroups['36-50']++;
                    else if (age <= 65) ageGroups['51-65']++;
                    else ageGroups['66+']++;
                });

                const ageData = Object.keys(ageGroups).map(group => ({
                    name: group,
                    value: ageGroups[group],
                }));

                setAgeData(ageData);
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
                link.download = "age_distribution.png";
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
                <h2 className='text-lg font-medium text-gray-100'>Age Distribution</h2>
                <button 
                    onClick={downloadChart} 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="mr-2 w-5 h-5" /> Download
                </button>
            </div>

            <div ref={chartRef} className="h-80 bg-gray-900 p-4 rounded-lg">
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart>
                        <Pie
                            data={ageData}
                            cx={"50%"}
                            cy={"50%"}
                            labelLine={false}
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {ageData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default AgeDistribution;
