// filepath: c:\Refugio\Refugio_Barangay_Profiling_System\frontend\src\App.jsx
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import ResidentsPage from "./pages/ResidentsPage";
import UsersPage from "./pages/UsersPage";
import SalesPage from "./pages/SalesPage";
import OrdersPage from "./pages/OrdersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const location = useLocation();
    console.log("Current path:", location.pathname);
    const user = JSON.parse(sessionStorage.getItem("user"));
    const userId = user ? user.userId : null;
    console.log("Session storage user:", user);
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    return (
        <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
            {/* BG */}
            <div className={`fixed inset-0 z-0 ${isAuthPage ? 'bg-transparent' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80'}`}>
                {!isAuthPage && <div className='absolute inset-0 backdrop-blur-sm' />}
            </div>

            {!isAuthPage && <Sidebar userId={userId} />}
            <div className ='flex-grow overflow-auto'>
                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/signup' element={<SignupPage />} />
                    <Route path='/' element={<Navigate to="/overview" />} />
                    <Route path='/overview' element={<OverviewPage />} />
                    <Route path='/residents' element={<ResidentsPage userId={userId} />} />
                    <Route path='/users' element={<UsersPage />} />
                    <Route path='/sales' element={<SalesPage />} />
                    <Route path='/orders' element={<OrdersPage />} />
                    <Route path='/analytics' element={<AnalyticsPage />} />
                    <Route path='/settings' element={<SettingsPage />} />
                </Routes>
            </div>
            <ToastContainer />
        </div>
    );
}

export default App;