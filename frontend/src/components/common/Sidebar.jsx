import { BarChart2, House, Menu, Settings, ChartNoAxesCombined, Phone, Users, ContactRound } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";

const SIDEBAR_ITEMS = [
    {
        name: "Dashboard",
        icon: BarChart2,
        color: "#6366f1",
        href: "/",
    },
    { name: "Residents", icon: ContactRound, color: "#8B5CF6", href: "/residents" },
    //{ name: "Household", icon: House, color: "#F59E0B", href: "/household" },   
    { name: "Demographics", icon: ChartNoAxesCombined, color: "#10B981", href: "/statistics" },
    { name: "Users", icon: Users, color: "#EC4899", href: "/users", roles: ["admin", "barangay captain"] },
    { name: "Officials", icon: Phone, color: "#3B82F6", href: "/officials" },
    { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [accountType, setAccountType] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = sessionStorage.getItem('userId'); // Get userId from sessionStorage
                if (!userId) {
                    throw new Error('User ID not found in session storage');
                }
                console.log(`Fetching user data for userId: ${userId}`);
                const response = await axios.get(`http://localhost:5000/user/${userId}`, { withCredentials: true });
                setAccountType(response.data.accountType);
                console.log(`Fetched accountType: ${response.data.accountType}`);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    console.log("Account Type:", accountType);

    const filteredItems = SIDEBAR_ITEMS.filter(item => {
        if (item.roles) {
            const isAllowed = accountType && item.roles.includes(accountType.toLowerCase());
            console.log(`Item: ${item.name}, Allowed: ${isAllowed}`);
            return isAllowed;
        }
        return true;
    });

    return (
        <motion.div
            className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
                isSidebarOpen ? "w-64" : "w-20"
            }`}
            animate={{ width: isSidebarOpen ? 256 : 80 }}
        >
            <div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
                >
                    <Menu size={24} />
                </motion.button>

                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.img
                            src="/logo_enhanced final.png" // Replace with the actual path to your logo
                            alt='Logo'
                            className='mt-1 mb-2 mx-auto'
                            style={{ width: '130px', height: '130px', marginBottom: '0px' }} // Adjust the size and margin as needed
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </AnimatePresence>

                <nav className='mt-8 flex-grow'>
                    {filteredItems.map((item) => (
                        <Link key={item.href} to={item.href}>
                            <motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'>
                                <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            className='ml-4 whitespace-nowrap'
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2, delay: 0.3 }}
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </Link>
                    ))}
                </nav>
            </div>
        </motion.div>
    );
};

export default Sidebar;