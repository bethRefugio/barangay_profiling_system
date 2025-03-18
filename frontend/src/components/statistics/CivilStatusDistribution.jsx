import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from "recharts";

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
                    const status = resident.civilStatus.toLowerCase();
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

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Civil Status Distribution</h2>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={statusData}>
                        <XAxis dataKey="name">
                            <Label value="Civil Status" offset={-5} position="insideBottom" />
                        </XAxis>
                        <YAxis allowDecimals={false} />
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