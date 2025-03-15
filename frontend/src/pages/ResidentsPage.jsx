import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useLocation } from 'react-router-dom';

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesTrendChart from "../components/residents/SalesTrendChart";
import ResidentsTable from "../components/residents/ResidentsTable";

const ResidentsPage = ({ residents: propResidents = [] }) => {
    const location = useLocation();
    const stateResidents = location.state?.residents || [];
    const residents = [...propResidents, ...stateResidents];

    const totalResidents = residents.length;
    const totalMales = residents.filter(resident => resident.gender?.toLowerCase() === 'male').length;
    const totalFemales = residents.filter(resident => resident.gender?.toLowerCase() === 'female').length;
    const totalEmployedResidents = residents.filter(resident => resident.employmentStatus?.toLowerCase() === 'employed').length;

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Residents' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Residents' icon={Package} value={totalResidents} color='#6366F1' />
                    <StatCard name='Total Males' icon={TrendingUp} value={totalMales} color='#10B981' />
                    <StatCard name='Total Females' icon={AlertTriangle} value={totalFemales} color='#F59E0B' />
                    <StatCard name='Total Employed Residents' icon={DollarSign} value={totalEmployedResidents} color='#EF4444' />
                </motion.div>

                <ResidentsTable />

                {/* CHARTS */}
                <div className='grid grid-col-1 lg:grid-cols-2 gap-8'>
                    <SalesTrendChart />
                    <CategoryDistributionChart />
                </div>
            </main>
        </div>
    );
};

export default ResidentsPage;