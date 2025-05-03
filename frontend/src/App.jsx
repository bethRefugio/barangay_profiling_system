// filepath: c:\Refugio\Refugio_Barangay_Profiling_System\frontend\src\App.jsx
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import ResidentsPage from "./pages/ResidentsPage";
import UsersPage from "./pages/UsersPage";
import DemographicsPage from "./pages/DemographicsPage";
import OfficialsPage from "./pages/OfficialsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RequestPage from "./pages/RequestPage";
import ManageRequestPage from "./pages/ManageRequestPage";
import ProjectsPage from "./pages/ProjectsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import EventsPage from "./pages/EventsPage";
import QRPage from "./pages/QRPage";
import AttendancePage from "./components/attendance/AttendancePage";
import ResidentAttendanceTable from "./components/attendance/ResidentAttendanceTable";
import OfficialsAttendanceTable from "./components/attendance/OfficialsAttendanceTable";
import RecordResidentAttendance from './components/attendance/RecordResidentAttendance';
import RecordOfficialsAttendance from './components/attendance/RecordOfficialsAttendance';


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
                    <Route path='/request' element={<RequestPage />} />
                    <Route path='/manage_request' element={<ManageRequestPage />} />
                    <Route path='/users' element={<UsersPage />} />
                    <Route path='/statistics' element={<DemographicsPage />} />
                    <Route path='/officials' element={<OfficialsPage />} />
                    <Route path='/settings' element={<SettingsPage />} />
                    <Route path='/projects' element={<ProjectsPage />} />
                    <Route path='/announcements' element={<AnnouncementsPage />} />
                    <Route path='/events' element={<EventsPage />} />
                    <Route path='/qr_code/*' element={<QRPage />} />
                    <Route path="/events/attendance" element={<AttendancePage />} />
                    <Route path="/events/attendance/residents_attendance" element={<ResidentAttendanceTable />} />
                    <Route path="/events/attendance/officials_attendance" element={<OfficialsAttendanceTable />} />
                    <Route path="/events/attendance/record_resident" element={<RecordResidentAttendance />} />
                    <Route path="/events/attendance/record_official" element={<RecordOfficialsAttendance />} />

                </Routes>
            </div>
           
        </div>
    );
}

export default App;