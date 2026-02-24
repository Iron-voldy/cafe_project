// hero section with background image and centered layout
import { motion } from 'framer-motion';
import { FaArrowRight, FaCoffee, FaShoppingCart, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import heroImg from '../../assets/cafe_hero.png';

const HeroSection = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    return (
        <section className="relative min-h-[88vh] overflow-hidden flex items-center">
            {/* bg image with overlay */}
            <div className="absolute inset-0">
                <img src={heroImg} alt="Cafe Interior" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/75 to-primary/90" />
            </div>

            {/* floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div key={i} className="absolute w-1 h-1 bg-amber-600/15 rounded-full"
                        initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0 }}
                        animate={{ y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], opacity: [0, 0.3, 0] }}
                        transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, ease: 'linear' }}
                    />
                ))}
            </div>

            {/* content */}
            <div className="w-full max-w-[1200px] mx-auto px-5 relative z-10 py-16">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center max-w-3xl mx-auto">
                    {/* badge */}
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-amber-600/10 border border-secondary/25 rounded-full px-4 py-2 mb-6">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        <span className="text-amber-600 text-xs font-medium tracking-wide">Cafe Management System</span>
                    </motion.div>

                    {/* heading */}
                    <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1]">
                        Manage Your Cafe<br /><span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">With Elegance</span>
                    </motion.h1>

                    {/* subtext */}
                    <motion.p variants={itemVariants} className="text-warm/60 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                        Streamline orders, track inventory, manage reservations, and process payments — all in one beautiful system.
                    </motion.p>

                    {/* cta */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                        <Link to="/dashboard" className="inline-flex items-center gap-2 bg-amber-600 text-amber-900 px-7 py-3 rounded-xl font-semibold hover:bg-accent transition-all duration-300 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-0.5 cursor-pointer">
                            Get Started <FaArrowRight />
                        </Link>
                        <Link to="/menu" className="inline-flex items-center gap-2 border-2 border-secondary/40 text-amber-600 px-7 py-3 rounded-xl font-semibold hover:bg-amber-600/10 transition-all duration-300 cursor-pointer">
                            <FaCoffee /> View Menu
                        </Link>
                    </motion.div>

                    {/* stats */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {[
                            { label: 'Orders', value: '500+', icon: FaShoppingCart },
                            { label: 'Menu Items', value: '120+', icon: FaCoffee },
                            { label: 'Tables', value: '50+', icon: FaCalendarAlt },
                            { label: 'Revenue', value: 'LKR 2M+', icon: FaDollarSign }
                        ].map(({ label, value, icon: Icon }, i) => (
                            <motion.div key={i} whileHover={{ scale: 1.04, y: -3 }} className="bg-white/90 backdrop-blur-md border border-white border-t border-l shadow-xl rounded-xl p-4 text-center">
                                <Icon className="text-amber-600 text-lg mx-auto mb-1.5" />
                                <p className="text-xl font-bold text-white">{value}</p>
                                <p className="text-warm/50 text-xs">{label}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFF8F0] to-transparent" />
        </section>
    );
};

export default HeroSection;
