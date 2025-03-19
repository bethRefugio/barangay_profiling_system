import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { UserCheck, UserPlus, UsersIcon, UserX, User } from "lucide-react";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import UsersTable from "../components/users/UsersTable";
import UserGrowthChart from "../components/users/UserGrowthChart";
import UserActivityHeatmap from "../components/users/UserActivityHeatmap";
import UserDemographicsChart from "../components/users/UserDemographicsChart";

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        residentUsers: 0,
        staffUsers: 0,
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/user');
                const data = await response.json();
                setUsers(data);

                const totalUsers = data.length;
                const activeUsers = data.filter(user => user.status === 'Active').length;
                const inactiveUsers = data.filter(user => user.status === 'Inactive').length;
                const residentUsers = data.filter(user => user.accountType === 'Resident').length;
                const staffUsers = data.filter(user => user.accountType === 'Staff').length;

                setUserStats({
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    residentUsers,
                    staffUsers,
                });
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Users' />

            <main className='max-w-7xl mx-auto py-6 px-3 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard
                        name='Total Users'
                        icon={UsersIcon}
                        value={userStats.totalUsers.toLocaleString()}
                        color='#6366F1'
                    />
                    <StatCard
                        name='Active Users'
                        icon={UserCheck}
                        value={userStats.activeUsers.toLocaleString()}
                        color='#10B981'
                    />
                    <StatCard
                        name='Inactive Users'
                        icon={UserX}
                        value={userStats.inactiveUsers.toLocaleString()}
                        color='#EF4444'
                    />
                    <StatCard
                        name='Resident Users'
                        icon={User}
                        value={userStats.residentUsers.toLocaleString()}
                        color='#FACC15'
                    />
                    <StatCard
                        name='Staff Users'
                        icon={User}
                        value={userStats.staffUsers.toLocaleString()}
                        color='#FB923C'
                    />
                </motion.div>

                <UsersTable />

                {/* USER CHARTS 
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8'>
                    <UserGrowthChart />
                    <UserActivityHeatmap />
                    <UserDemographicsChart />
                </div> */}
            </main>
        </div>
    );
};

export default UsersPage;