// slim compact footer — hidden on login/register via prop
import { Link, useLocation } from 'react-router-dom';
import { FaCoffee, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    const location = useLocation();
    // hide footer on auth pages
    if (['/login', '/register'].includes(location.pathname)) return null;

    return (
        <footer className="bg-amber-900 text-warm/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FaCoffee className="text-amber-600 text-lg" />
                            <span className="text-base font-bold text-amber-600">CafeSync</span>
                        </div>
                        <p className="text-xs leading-relaxed max-w-xs">
                            Modern cafe management system designed to streamline operations, enhance customer experience, and boost efficiency.
                        </p>
                    </div>

                    {/* quick links */}
                    <div>
                        <h3 className="text-amber-600 font-semibold mb-3 text-sm">Quick Links</h3>
                        <ul className="space-y-1.5 text-xs">
                            <li><Link to="/dashboard" className="hover:text-amber-600 transition-colors">Dashboard</Link></li>
                            <li><Link to="/menu" className="hover:text-amber-600 transition-colors">Menu Management</Link></li>
                            <li><Link to="/orders" className="hover:text-amber-600 transition-colors">Order Tracking</Link></li>
                            <li><Link to="/tables" className="hover:text-amber-600 transition-colors">Reservations</Link></li>
                        </ul>
                    </div>

                    {/* contact */}
                    <div>
                        <h3 className="text-amber-600 font-semibold mb-3 text-sm">Contact Us</h3>
                        <ul className="space-y-2 text-xs">
                            <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-amber-600 shrink-0" size={13} /> Malabe, Sri Lanka</li>
                            <li className="flex items-center gap-2"><FaPhone className="text-amber-600 shrink-0" size={13} /> +94 11 234 5678</li>
                            <li className="flex items-center gap-2"><FaEnvelope className="text-amber-600 shrink-0" size={13} /> info@cafesync.lk</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-6 pt-4 text-center text-xs text-amber-900-light/40">
                    <p>&copy; {new Date().getFullYear()} CafeSync SaaS Solutions. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
