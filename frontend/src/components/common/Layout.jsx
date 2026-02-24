import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaClipboardList,
    FaMoneyBillWave,
    FaBookOpen,
    FaChair,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaUserCircle,
    FaCoffee
} from 'react-icons/fa';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define navigation links based on user roles
    // We assume backend roles: admin, staff, customer
    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: <FaHome />, roles: ['admin', 'staff', 'customer'] },
        { name: 'Orders', path: '/orders', icon: <FaClipboardList />, roles: ['admin', 'staff', 'customer'] },
        { name: 'Payments', path: '/payments', icon: <FaMoneyBillWave />, roles: ['admin', 'staff'] },
        { name: 'Menu & Inventory', path: '/menu', icon: <FaBookOpen />, roles: ['admin', 'staff'] },
        { name: 'Table Reservations', path: '/tables', icon: <FaChair />, roles: ['admin', 'staff', 'customer'] },
    ];

    // Filter links based on current user's role
    const filteredLinks = navLinks.filter(link =>
        !user || !link.roles || link.roles.includes(user.role || 'customer')
    );

    const NavItem = ({ name, path, icon }) => {
        const isActive = location.pathname === path;
        return (
            <NavLink
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                        ? 'bg-amber-100 text-amber-900 shadow-sm border-l-4 border-amber-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-amber-700'
                    }`}
            >
                <div className={`text-xl ${isActive ? 'text-amber-600' : 'text-gray-400'}`}>
                    {icon}
                </div>
                <span className="font-medium">{name}</span>
            </NavLink>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-gray-800">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white shadow-xl lg:shadow-md transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-600 rounded-lg text-white">
                            <FaCoffee className="text-2xl" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">
                            CafeSync
                        </span>
                    </div>
                    <button
                        className="lg:hidden text-gray-400 hover:text-gray-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
                    {filteredLinks.map((link) => (
                        <NavItem key={link.name} {...link} />
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-4">
                        <FaUserCircle className="text-3xl text-amber-600" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize truncate">
                                {user?.role || 'customer'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header (Mobile Only for Sidebar Toggle, Desktop for actions/profile if needed) */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:justify-end shadow-sm z-10">
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <FaBars className="text-2xl" />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Empty space for future header actions (notifications, etc) */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
