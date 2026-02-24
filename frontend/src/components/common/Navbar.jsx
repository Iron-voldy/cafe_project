// compact navbar with 64px height, hover underline, profile dropdown
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaCoffee, FaCog, FaChevronDown } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const profileRef = useRef(null);

    // close profile dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
        setProfileOpen(false);
    };

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/orders', label: 'Orders' },
        { path: '/menu', label: 'Menu' },
        { path: '/tables', label: 'Tables' },
        { path: '/payments', label: 'Payments' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-amber-900 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-[64px]">
                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <FaCoffee className="text-amber-600 text-xl" />
                        <span className="text-lg font-bold text-amber-600 tracking-tight">CafeSync</span>
                    </Link>

                    {/* desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 group ${isActive(link.path)
                                    ? 'text-amber-600'
                                    : 'text-warm/70 hover:text-white'
                                    }`}
                            >
                                {link.label}
                                {/* underline indicator */}
                                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-amber-600 rounded-full transition-all duration-300 ${isActive(link.path) ? 'w-4/5' : 'w-0 group-hover:w-3/5'
                                    }`} />
                            </Link>
                        ))}
                    </div>

                    {/* desktop auth */}
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-full bg-amber-600/20 border border-secondary/40 flex items-center justify-center">
                                        <FaUser className="text-amber-600 text-xs" />
                                    </div>
                                    <span className="text-amber-600 text-[13px] font-medium">{user?.firstName}</span>
                                    <FaChevronDown className={`text-warm/50 text-xs transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* profile dropdown */}
                                <AnimatePresence>
                                    {profileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-full mt-1.5 w-48 bg-dark border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="px-3.5 py-3 border-b border-white/10">
                                                <p className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                                                <p className="text-warm/50 text-xs mt-0.5">{user?.email}</p>
                                            </div>
                                            <div className="py-1.5">
                                                <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2 text-warm/70 hover:text-white hover:bg-white/5 text-[13px] transition-colors">
                                                    <FaCog size={13} /> Settings
                                                </Link>
                                                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-[13px] transition-colors cursor-pointer">
                                                    <FaSignOutAlt size={13} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-3.5 py-1.5 text-[13px] text-amber-600 hover:text-white font-medium transition-colors">Login</Link>
                                <Link to="/register" className="px-3.5 py-1.5 text-[13px] bg-amber-600 text-amber-900 rounded-lg hover:bg-accent font-semibold transition-colors">Register</Link>
                            </div>
                        )}
                    </div>

                    {/* mobile hamburger */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-warm hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>
            </div>

            {/* mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden bg-dark border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-2.5 space-y-0.5">
                            {navLinks.map((link) => (
                                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-amber-600/10 text-amber-600' : 'text-warm/70 hover:text-white hover:bg-white/5'}`}
                                >{link.label}</Link>
                            ))}
                            <div className="pt-2 mt-2 border-t border-white/10">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-3 py-2 text-amber-600 text-sm flex items-center gap-2">
                                            <FaUser size={14} /> {user?.firstName} {user?.lastName}
                                        </div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 rounded-lg font-medium transition-colors cursor-pointer">
                                            <FaSignOutAlt size={14} /> Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm text-amber-600 font-medium">Login</Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm bg-amber-600 text-amber-900 rounded-lg text-center font-semibold mt-1">Register</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
