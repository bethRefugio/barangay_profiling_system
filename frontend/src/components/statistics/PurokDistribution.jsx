import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from "recharts";

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

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className='text-xl font-semibold text-gray-100 mb-4'>Purok Distribution</h2>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={purokData}>
                        <XAxis dataKey="name">
                            <Label value="Purok" offset={-5} position="insideBottom" />
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

export default PurokDistribution;