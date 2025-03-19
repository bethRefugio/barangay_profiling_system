import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from "recharts";
import { Download } from "lucide-react"; // Using Download icon from lucide-react
import html2canvas from "html2canvas";


const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-gray-800 p-2 rounded shadow-lg">
                <p className="label text-white">{`Purok ${label}`}</p>
                <p className="intro text-white">{`No. of Residents: ${payload[0].value}`}</p>
            </div>
        );
    }

    return null;
};

const PurokDistribution = () => {
    const [purokData, setPurokData] = useState([]);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await fetch('http://localhost:5000/resident');
                const residents = await response.json();

                const purokGroups = {};
                // Initialize purokGroups with Purok 1 to Purok 15
                for (let i = 1; i <= 15; i++) {
                    purokGroups[i] = 0;
                }

                residents.forEach(resident => {
                    const purok = parseInt(resident.purok.replace('Purok ', ''));
                    if (purokGroups[purok] !== undefined) {
                        purokGroups[purok]++;
                    }
                });

                const purokData = Object.keys(purokGroups).map(purok => ({
                    name: purok,
                    value: purokGroups[purok],
                }));

                setPurokData(purokData);
            } catch (error) {
                console.error('Error fetching residents:', error);
            }
        };

        fetchResidents();
    }, []);

    // ✅ Fix: Ensure chartRef is applied to a wrapping div
    const downloadChart = async () => {
        if (chartRef.current) {
            html2canvas(chartRef.current, { backgroundColor: "#1F2937" }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "purok_distribution.png";
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
                <h2 className="text-lg font-semibold text-gray-200">Purok Distribution</h2>
                <button 
                    onClick={downloadChart} 
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Download className="mr-2 w-5 h-5" /> Download
                </button>
            </div>

            {/* ✅ Fix: Wrap the chart inside a div with ref={chartRef} */}
            <div ref={chartRef} className="bg-gray-900 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={purokData}>
                        <XAxis dataKey="name">
                            <Label value="Purok" offset={-5} position="insideBottom" fill="#ffffff" />
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

export default PurokDistribution;
