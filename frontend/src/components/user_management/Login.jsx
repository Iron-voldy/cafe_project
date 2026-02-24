// login page component with modern animations
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaSignInAlt, FaCoffee, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            // customers go to home page, admin/staff go to dashboard
            navigate(result.user?.role === 'customer' ? '/' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-[540px] flex flex-col items-center justify-center min-h-[90vh]"
            >
                {/* logo */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-center mb-10 w-full">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <FaCoffee className="text-amber-700 text-3xl" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">CafeSync</span>
                    </div>
                    <p className="text-amber-900/60 text-sm">Sign in to manage your cafe</p>
                </motion.div>

                {/* login form */}
                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    onSubmit={handleSubmit}
                    className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-8 sm:p-10 shadow-xl w-full hover:shadow-2xl transition-shadow duration-300"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

                    {/* error message */}
                    {error && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                            {error}
                        </motion.div>
                    )}

                    {/* email field */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* password field */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 transition-colors">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <FaSignInAlt />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>

                    {/* register link */}
                    <p className="text-center text-gray-500 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-amber-600 hover:text-amber-800 font-medium transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default Login;
