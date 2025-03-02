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

function App() {
    const location = useLocation();
    console.log("Current path:", location.pathname);
    console.log("Session storage user:", sessionStorage.getItem("user"));
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignupPage />} />
    </Routes>
    return (
        <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
            {/* BG */}
                <div className={`fixed inset-0 z-0 ${isAuthPage ? 'bg-transparent' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80'}`}>
                {!isAuthPage && <div className='absolute inset-0 backdrop-blur-sm' />}

            </div>

            {!isAuthPage && <Sidebar />}
            <div className={isAuthPage ? 'flex flex-col items-center justify-center w-full bg-white p-6 rounded-lg shadow-md' : 'flex-grow'}>

                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/signup' element={<SignupPage />} />
                    <Route path='/overview' element={<OverviewPage />} />
                    <Route path='/residents' element={<ResidentsPage />} />
                    <Route path='/users' element={<UsersPage />} />
                    <Route path='/sales' element={<SalesPage />} />
                    <Route path='/orders' element={<OrdersPage />} />
                    <Route path='/analytics' element={<AnalyticsPage />} />
                    <Route path='/settings' element={<SettingsPage />} />
                    
                </Routes>
            </div>
        </div>
    );
}
export default App;
