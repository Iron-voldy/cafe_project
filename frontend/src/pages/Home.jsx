// home page with hero, features, about section — balanced layout
import { motion } from 'framer-motion';
import { FaShoppingCart, FaDollarSign, FaBookOpen, FaCalendarAlt, FaArrowRight, FaCheck, FaChartLine, FaUsers, FaGlobe } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/common/HeroSection';
import Footer from '../components/common/Footer';

const Home = () => {
    const features = [
        { icon: FaShoppingCart, title: 'Order Management', desc: 'Track and manage all customer orders seamlessly from counter or online platforms.', link: '/orders', color: 'from-blue-500 to-blue-600' },
        { icon: FaDollarSign, title: 'Billing & Payments', desc: 'Automated billing, secure multiple payment methods, and instant invoice generation.', link: '/payments', color: 'from-green-500 to-green-600' },
        { icon: FaBookOpen, title: 'Menu & Inventory', desc: 'Full menu management with real-time inventory tracking, recipe costs, and low-stock alerts.', link: '/menu', color: 'from-orange-500 to-orange-600' },
        { icon: FaCalendarAlt, title: 'Table & Reservations', desc: 'Manage interactive table layouts, live availability, and online customer reservations.', link: '/tables', color: 'from-purple-500 to-purple-600' }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <HeroSection />

            {/* features section */}
            <section className="py-16 bg-[#FFF8F0]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-amber-900 mb-3">Enterprise-Grade Components</h2>
                        <p className="text-amber-900/60 text-sm max-w-lg mx-auto">Our comprehensive system covers every aspect of modern cafe and restaurant management, designed to scale with your business.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                className="bg-white rounded-xl p-5 shadow-md border border-amber-100 hover:scale-[1.02] transition-transform duration-200 flex flex-col"
                            >
                                <div className={`w-11 h-11 rounded-lg bg-gradient-to-r ${f.color} flex items-center justify-center mb-4 shadow-sm`}>
                                    <f.icon className="text-white text-lg" />
                                </div>
                                <h3 className="text-base font-bold text-amber-900 mb-2">{f.title}</h3>
                                <p className="text-amber-900/60 text-xs mb-4 leading-relaxed flex-1">{f.desc}</p>
                                <Link to={f.link} className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold hover:text-amber-800 transition-colors mt-auto">
                                    Explore Feature <FaArrowRight size={12} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* about / why cafesync section — balanced 50/50 */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* left — why cafesync */}
                        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-4">
                                THE SMART CHOICE
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-6 leading-tight">
                                Transform your cafe operations with <span className="text-amber-600">CafeSync</span>
                            </h2>
                            <p className="text-gray-600 text-base mb-4 leading-relaxed">
                                Traditional restaurant management relies on fragmented, manual processes causing order mistakes, slow service, and inaccurate inventory tracking.
                            </p>
                            <p className="text-gray-600 text-base mb-8 leading-relaxed">
                                <strong>CafeSync</strong> provides a unified cloud platform that bridges front-of-house operations with back-office analytics to improve efficiency, accuracy, and customer satisfaction globally.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['Real-time Order Tracking', 'Integrated Billing', 'Inventory Management', 'Table Reservations'].map((item, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <FaCheck className="text-green-600 text-[12px]" />
                                        </div>
                                        <span className="text-gray-800 text-sm font-semibold">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* right — social proof / metrics (replacing academic project details) */}
                        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-full max-w-lg mx-auto lg:ml-auto">
                            {/* main metric card */}
                            <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <FaChartLine size={120} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 relative z-10 text-amber-100">Performance Impact</h3>

                                <div className="space-y-6 relative z-10 mt-6">
                                    <div className="flex justify-between items-end border-b border-amber-700/50 pb-4">
                                        <div>
                                            <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wider mb-1">Order Processing</p>
                                            <p className="text-3xl font-extrabold">Instant</p>
                                        </div>
                                        <FaDollarSign className="text-amber-400 text-2xl mb-1" />
                                    </div>
                                    <div className="flex justify-between items-end border-b border-amber-700/50 pb-4">
                                        <div>
                                            <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wider mb-1">Menu & Stock Tracking</p>
                                            <p className="text-3xl font-extrabold">Live</p>
                                        </div>
                                        <FaChartLine className="text-amber-400 text-2xl mb-1" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wider mb-1">Table Management</p>
                                            <p className="text-3xl font-extrabold">Easy</p>
                                        </div>
                                        <FaUsers className="text-amber-400 text-2xl mb-1" />
                                    </div>
                                </div>
                            </div>

                            {/* secondary trust card */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                        <FaGlobe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">4</p>
                                        <p className="text-xs text-gray-500 font-medium">Core Modules</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <FaUsers size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">24/7</p>
                                        <p className="text-xs text-gray-500 font-medium">System Availability</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
