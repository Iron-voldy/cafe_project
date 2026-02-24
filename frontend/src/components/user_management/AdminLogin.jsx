import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt, FaCoffee, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await login(email, password);
            // Verify if the logged-in user is an admin or staff
            if (response.user.role === 'admin' || response.user.role === 'staff') {
                navigate('/dashboard');
            } else {
                setError('Unauthorized access. Admin or Staff privileges required.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md flex flex-col items-center justify-center min-h-[90vh]"
            >
                {/* logo */}
                <div className="text-center mb-10 w-full">
                    <div className="inline-flex items-center space-x-3 mb-4">
                        <FaUserShield className="text-amber-500 text-4xl" />
                        <span className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                            Admin Portal
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm">Secure access for staff and administrators</p>
                </div>

                {/* login form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl w-full"
                >
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">System Login</h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-lg p-3 mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-5">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@cafesync.com"
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter secure password"
                                className="w-full pl-10 pr-12 py-3 bg-black/20 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-3.5 rounded-xl font-semibold hover:bg-amber-500 transition-colors disabled:opacity-70 cursor-pointer shadow-lg shadow-amber-600/30"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <FaSignInAlt />
                                <span>Access Dashboard</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
