import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366F1", "#EC4899"];

const GenderDistribution = () => {
    const [genderData, setGenderData] = useState([]);

    useEffect(() => {
        const fetchResidents = async () => {
            try {
                const response = await fetch('http://localhost:5000/resident');
                const residents = await response.json();

                const genderGroups = {
                    'Male': 0,
                    'Female': 0,
                };

                residents.forEach(resident => {
                    const gender = resident.gender;
                    if (gender === 'Male') genderGroups['Male']++;
                    else if (gender === 'Female') genderGroups['Female']++;
                });

                const genderData = Object.keys(genderGroups).map(group => ({
                    name: group,
                    value: genderGroups[group],
                }));

                setGenderData(genderData);
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
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Gender Distribution</h2>
            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart>
                        <Pie
                            data={genderData}
                            cx={"50%"}
                            cy={"50%"}
                            labelLine={false}
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='value'
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {genderData.map((entry, index) => (
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

export default GenderDistribution;