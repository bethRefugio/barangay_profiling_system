import Header from "../components/common/Header";
import { motion } from "framer-motion";
import { BarChart2, ContactRound, Users, LandPlot, MapPinned, Earth, Compass, Pin, Mailbox, LocateFixed, TrendingUp } from "lucide-react";

import OfficialsList from "../components/officials/OfficialsList";
import RevenueChart from "../components/officials/RevenueChart";
import ChannelPerformance from "../components/officials/ChannelPerformance";
import ProductPerformance from "../components/officials/ProductPerformance";
import UserRetention from "../components/officials/UserRetention";
import CustomerSegmentation from "../components/officials/CustomerSegmentation";
import AIPoweredInsights from "../components/officials/AIPoweredInsights";
import StatCard from "../components/common/StatCard";

const AnalyticsPage = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title={"Barangay Officials"} />

            <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
                
                <OfficialsList />
               
               {/*  <RevenueChart />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <ChannelPerformance />
                    <ProductPerformance />
                    <UserRetention />
                    <CustomerSegmentation />
                </div>

                <AIPoweredInsights /> */}
            </main>
        </div>
    );
};
export default AnalyticsPage;