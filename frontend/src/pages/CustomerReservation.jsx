// customer-facing reservation page — standalone with Navbar+Footer
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaPlus, FaTimes, FaChair, FaClock, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';
import toast from 'react-hot-toast';

const CustomerReservation = () => {
    const { user } = useAuth();
    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', tableId: '', specialRequests: '' });

    useEffect(() => {
        fetchData();
        if (user) {
            setForm(f => ({ ...f, customerName: `${user.firstName} ${user.lastName}`, customerPhone: user.phone || '' }));
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [tabRes, resRes] = await Promise.all([
                API.get('/tables/tables').catch(() => ({ data: [] })),
                API.get('/tables/reservations').catch(() => ({ data: [] }))
            ]);
            setTables(tabRes.data);
            // show only current user's reservations
            const myRes = resRes.data.filter(r => r.customerName === `${user?.firstName} ${user?.lastName}` || r.customerId === user?.id);
            setReservations(myRes);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tables/reservations', { ...form, status: 'confirmed' });
            toast.success('Reservation booked!');
            fetchData(); setShowModal(false);
        } catch { toast.error('Failed to book reservation'); }
    };

    const availableTables = tables.filter(t => t.status === 'available');

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
            <Navbar />

            {/* hero */}
            <section className="bg-gradient-to-br from-amber-900 to-amber-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">Table Reservations</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-amber-200/80 text-sm">Reserve a table for your next visit</motion.p>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
                {/* book button */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">My Reservations</h2>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer">
                        <FaPlus size={14} /> Book a Table
                    </button>
                </div>

                {/* available tables preview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                    {availableTables.slice(0, 8).map(t => (
                        <div key={t.id} className="bg-white rounded-lg p-3 border border-green-100 shadow-sm text-center">
                            <FaChair className="text-green-500 text-lg mx-auto mb-1" />
                            <p className="text-sm font-bold text-gray-900">Table {t.tableNumber}</p>
                            <p className="text-[10px] text-gray-400">{t.seatingCapacity} seats • {t.location}</p>
                        </div>
                    ))}
                </div>

                {/* my reservations */}
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-600 border-t-transparent" /></div>
                ) : reservations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
                        <FaCalendarAlt className="text-3xl text-amber-300 mb-4" />
                        <h3 className="text-base font-bold text-gray-900 mb-1">No Reservations</h3>
                        <p className="text-sm text-gray-500">Book a table to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reservations.map((r, i) => (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><FaCalendarAlt className="text-purple-500" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Table #{r.tableId}</p>
                                        <p className="text-[10px] text-gray-400">{new Date(r.reservationDate).toLocaleDateString()} at {r.reservationTime} • {r.partySize} guests</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.status === 'confirmed' ? 'bg-green-100 text-green-700' : r.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* booking modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Book a Table</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Your Name</label>
                                        <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="text" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                        <input type="date" value={form.reservationDate} onChange={e => setForm({ ...form, reservationDate: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                                        <input type="time" value={form.reservationTime} onChange={e => setForm({ ...form, reservationTime: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Party Size</label>
                                        <input type="number" min="1" value={form.partySize} onChange={e => setForm({ ...form, partySize: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Table</label>
                                        <select value={form.tableId} onChange={e => setForm({ ...form, tableId: e.target.value })} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                                            <option value="">Select table</option>
                                            {availableTables.map(t => (
                                                <option key={t.id} value={t.id}>Table {t.tableNumber} ({t.seatingCapacity} seats, {t.location})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Special Requests</label>
                                    <textarea value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" rows={2} placeholder="Any special requests..." />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg">Cancel</button>
                                    <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md">Book Now</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default CustomerReservation;
