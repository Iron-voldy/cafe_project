// register page component with modern animations
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus, FaCoffee, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', role: 'customer' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // handle input change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary flex items-center justify-center px-6 py-10">
            {/* floating background */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-48 h-48 bg-amber-600/[0.03] rounded-full"
                        initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%' }}
                        animate={{ x: [Math.random() * 80 + '%', Math.random() * 80 + '%'], y: [Math.random() * 80 + '%', Math.random() * 80 + '%'] }}
                        transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, repeatType: 'reverse' }}
                    />
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-lg">
                {/* logo */}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="text-center mb-6">
                    <div className="inline-flex items-center space-x-2 mb-3">
                        <FaCoffee className="text-amber-600 text-3xl" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">CafeSync</span>
                    </div>
                    <p className="text-warm/60 text-sm">Create your account</p>
                </motion.div>

                {/* register form */}
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>

                    {/* error message */}
                    {error && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-danger/20 border border-danger/50 text-white rounded-lg p-3 mb-4 text-sm">
                            {error}
                        </motion.div>
                    )}

                    {/* name fields */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-warm/80 text-sm font-medium mb-1">First Name</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="First" className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-warm/80 text-sm font-medium mb-1">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Last" className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                        </div>
                    </div>

                    {/* email field */}
                    <div className="mb-4">
                        <label className="block text-warm/80 text-sm font-medium mb-1">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email" className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                        </div>
                    </div>

                    {/* phone field */}
                    <div className="mb-4">
                        <label className="block text-warm/80 text-sm font-medium mb-1">Phone</label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                        </div>
                    </div>

                    {/* role is always customer for public registration */}

                    {/* password fields */}
                    <div className="mb-4">
                        <label className="block text-warm/80 text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Min 6 characters" className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm/60 hover:text-amber-600">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-warm/80 text-sm font-medium mb-1">Confirm Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600" />
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm password" className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-warm/40 focus:outline-none focus:border-secondary transition-all text-sm" />
                        </div>
                    </div>

                    {/* submit button */}
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-amber-600 text-amber-900 py-3 rounded-xl font-semibold hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer">
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" /> : (<><FaUserPlus /><span>Create Account</span></>)}
                    </button>

                    {/* login link */}
                    <p className="text-center text-warm/60 text-sm mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-amber-600 hover:text-accent font-medium transition-colors">Sign In</Link>
                    </p>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default Register;
