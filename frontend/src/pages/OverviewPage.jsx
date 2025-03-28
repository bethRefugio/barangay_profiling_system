import { BarChart2, ContactRound, Users, LandPlot, MapPinned, Earth, Compass, Pin, Mailbox, LocateFixed, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/SalesChannelChart";
import BunawanMap from "../components/overview/BunawanMap";

const OverviewPage = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Dashboard' />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                {/* STATS */}
                <motion.div
                    className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <StatCard name='Total Population' subtitle='[2020]' icon={Users} value='2,025' color='#6366F1' />
                    <StatCard name='Area' subtitle='' icon={LandPlot} value='13.15 km²' color='#8B5CF6' />
                    <StatCard name='Population Density' subtitle='[2020]' icon={ContactRound} value='153.9/km²' color='#EC4899' />
                    <StatCard name='Annual Population Change' subtitle='[2015 → 2020]' icon={BarChart2} value='1.9%' color='#10B981' />
                </motion.div>

                 {/* TEXT */}
                 <div className='text-center mb-8'>
                    <h1 className='text-4xl font-bold'>Barangay Bunawan</h1>
                    <br></br>
                    <h4 className='text-2xl font-bold'>City of Iligan</h4>
                    <br></br>
                    <p className='text-lg'>Bunawan is a barangay in the city of Iligan. Its population as determined by the 2020 Census was 2,025. This represented 0.56% of the total population of Iligan.</p>
                </div>

                {/* SUMMARY DATA AND IMAGE */}
                <div className='flex mb-5'>
                    <motion.div
                        className='w-1/3 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 ps-8 ml-4'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className='text-lg font-medium mb-4 text-gray-100 tracking-wider text-center'>Summary Data</h2>
                        <div className='grid grid-cols-1 gap-4'>
                            <p className='text-gray-100 flex items-center py-1'><MapPinned className='mr-2 text-blue-500' /> Type: Barangay</p>
                            <p className='text-gray-100 flex items-center py-1'><Earth className='mr-2 text-green-500' /> Island group: Mindanao</p>
                            <p className='text-gray-100 flex items-center py-1'><Compass className='mr-2 text-yellow-500' /> Region: Northern Mindanao (Region X)</p>
                            <p className='text-gray-100 flex items-center py-1'><Pin className='mr-2 text-red-500' /> City: Iligan</p>
                            <p className='text-gray-100 flex items-center py-1'><Mailbox className='mr-2 text-purple-500' /> Postal code: 9200</p>
                            <p className='text-gray-100 flex items-center py-1'><Users className='mr-2 text-pink-500' /> Population (2020): 2,025</p>
                            <p className='text-gray-100 flex items-center py-1'><LocateFixed className='mr-2 text-orange-500' /> Coordinates: 8.3023, 124.3028 (8° 18' North, 124° 18' East)</p>
                            <p className='text-gray-100 flex items-center py-1'><TrendingUp className='mr-2 text-indigo-500' /> Estimated elevation above sea level: 342.6 meters (1,124.0 feet)</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className='w-2/3 ml-4'
                        style={{ height: "500px" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                       <BunawanMap />
                    </motion.div>
                </div>
            {/* Vision and Mission Section */}
            <div className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mt-6'>
                <h2 className='text-lg font-medium mb-4 text-gray-100 tracking-wider text-center'>Vision</h2>
                <p className='text-gray-300 text-justify'>
                    Barangay Bunawan envisions a progressive, peaceful, and environmentally sustainable community where residents thrive in a safe and inclusive environment. 
                    We aim to foster unity, economic growth, and social development while preserving our cultural heritage and natural resources.
                </p>
                <h2 className='text-lg font-medium mt-6 mb-4 text-gray-100 tracking-wider text-center'>Mission</h2>
                <p className='text-gray-300 text-justify'>
                    Our mission is to provide transparent and efficient governance that empowers every resident of Barangay Bunawan. 
                    We are committed to delivering quality public services, promoting sustainable livelihood programs, ensuring public safety, 
                    and enhancing community welfare through active participation, innovation, and collaboration.
                </p>
            </div>
                
            </main>
        </div>
    );
};
export default OverviewPage;