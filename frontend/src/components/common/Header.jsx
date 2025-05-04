import { useNavigate } from 'react-router-dom';
import { LogOut, LogIn } from 'lucide-react';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId'); // Check if userId exists in session storage

    const handleLogout = () => {
        sessionStorage.removeItem('userId');
        navigate('/login');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <header className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700'>
            <div className='max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between'>
                <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
                {userId ? (
                    <button
                        className='bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded transition duration-200 flex items-center'
                        onClick={handleLogout}
                    >
                        <LogOut size={18} className="mr-2" />
                        Logout
                    </button>
                ) : (
                    <button
                        className='bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded transition duration-200 flex items-center'
                        onClick={handleLogin}
                    >
                        <LogIn size={18} className="mr-2" />
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;