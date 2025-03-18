import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { AlertTriangle, DollarSign, ContactRound, UserCircle, BookCheck } from "lucide-react";
import SalesOverviewChart from "../components/statistics/SalesOverviewChart";
import PurokDistribution from "../components/statistics/PurokDistribution";
import AgeDistribution from "../components/statistics/AgeDistribution";
import GenderDistribution from "../components/statistics/GenderDistribution";
import CivilStatusDistribution from "../components/statistics/CivilStatusDistribution";

const DemographicsPage = () => {
	const [residents, setResidents] = useState([]);
		const location = useLocation();
		const stateResidents = location.state?.residents || [];
	
		useEffect(() => {
			const fetchResidents = async () => {
				try {
					const response = await fetch('http://localhost:5000/resident');
					const data = await response.json();
					setResidents([...data, ...stateResidents]);
				} catch (error) {
					console.error('Error fetching residents:', error);
				}
			};
	
			fetchResidents();
		}, [stateResidents]);
	
		const totalResidents = residents.length;
		const totalMales = residents.filter(resident => resident.gender?.toLowerCase() === 'male').length;
		const totalFemales = residents.filter(resident => resident.gender?.toLowerCase() === 'female').length;
		const totalEmployedResidents = residents.filter(resident => resident.employment_status?.toLowerCase() === 'employed').length;
	
		
	return (
		<div className='flex-1 overflow-auto relative z-10'>
			<Header title='Demographics' />

			<main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
				{/* SALES STATS */}
				<motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Residents' icon={ContactRound} value={totalResidents} color='#10B981' />
                    <StatCard name='Total Males' icon={UserCircle} value={totalMales} color='#6366F1' />
                    <StatCard name='Total Females' icon={UserCircle} value={totalFemales} color='#EC4899' />
                    <StatCard name='Total Employed Residents' icon={BookCheck} value={totalEmployedResidents} color='#EF4444' />
                </motion.div>
				

				<SalesOverviewChart />

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
					<PurokDistribution />
					<AgeDistribution />
					<GenderDistribution />
					<CivilStatusDistribution />
				</div>
			</main>
		</div>
	);
};
export default DemographicsPage;
