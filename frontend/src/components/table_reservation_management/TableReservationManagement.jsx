// table & reservation management with toggle tabs, contained search, better empty states
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaTh, FaUsers } from 'react-icons/fa';

import API from '../../services/api';
import toast from 'react-hot-toast';

const TableReservationManagement = () => {
    const [activeTab, setActiveTab] = useState('tables');
    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: '', location: 'indoor', status: 'available' });
    const [resForm, setResForm] = useState({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', notes: '' });
    const [showResModal, setShowResModal] = useState(false);
    const [editingRes, setEditingRes] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [tabRes, resRes] = await Promise.all([
                API.get('/tables/tables').catch(() => ({ data: [] })),
                API.get('/tables/reservations').catch(() => ({ data: [] }))
            ]);
            setTables(tabRes.data); setReservations(resRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleTableSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) { await API.put(`/tables/tables/${editingItem.id}`, tableForm); toast.success('Table updated'); }
            else { await API.post('/tables/tables', tableForm); toast.success('Table added'); }
            fetchData(); setShowModal(false);
        } catch { toast.error('Failed to save'); }
    };

    const handleResSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRes) { await API.put(`/tables/reservations/${editingRes.id}`, resForm); toast.success('Reservation updated'); }
            else { await API.post('/tables/reservations', resForm); toast.success('Reservation created'); }
            fetchData(); setShowResModal(false);
        } catch { toast.error('Failed to save'); }
    };

    const handleDelete = async (id, type) => {
        if (!confirm(`Delete this ${type}?`)) return;
        try {
            await API.delete(`/tables/${type === 'table' ? 'tables' : 'reservations'}/${id}`);
            toast.success('Deleted'); fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const openEditTable = (t) => { setEditingItem(t); setTableForm({ tableNumber: t.tableNumber, capacity: t.capacity, location: t.location, status: t.status }); setShowModal(true); };
    const openEditRes = (r) => { setEditingRes(r); setResForm({ customerName: r.customerName, customerPhone: r.customerPhone, partySize: r.partySize, reservationDate: r.reservationDate?.split('T')[0], reservationTime: r.reservationTime, status: r.status, tableId: r.tableId, notes: r.notes || '' }); setShowResModal(true); };

    const filteredTables = tables.filter(t => String(t.tableNumber).includes(search) || t.location?.toLowerCase().includes(search.toLowerCase()));
    const filteredRes = reservations.filter(r => r.customerName?.toLowerCase().includes(search.toLowerCase()));

    const getTableStatusColor = (s) => ({ available: 'bg-success/15 text-success border-success/30', occupied: 'bg-danger/15 text-danger border-danger/30', reserved: 'bg-warning/15 text-warning border-warning/30', maintenance: 'bg-gray-100 text-gray-500 border-gray-300' }[s] || 'bg-gray-100 text-gray-500 border-gray-300');

    // summary stats
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const todayRes = reservations.filter(r => { const d = new Date(r.reservationDate); const t = new Date(); return d.toDateString() === t.toDateString(); }).length;

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* header */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2"><FaCalendarAlt className="text-amber-600" /> Tables & Reservations</h1>
                        <p className="text-amber-900-light/50 text-xs mt-0.5">Manage tables and reservations effectively.</p>
                    </div>
                    <button onClick={() => { activeTab === 'tables' ? (setEditingItem(null), setTableForm({ tableNumber: '', capacity: '', location: 'indoor', status: 'available' }), setShowModal(true)) : (setEditingRes(null), setResForm({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', notes: '' }), setShowResModal(true)); }} className="flex items-center gap-1.5 bg-amber-600 text-amber-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm cursor-pointer">
                        <FaPlus size={15} /> Add {activeTab === 'tables' ? 'Table' : 'Reservation'}
                    </button>
                </motion.div>

                {/* summary row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><FaTh className="text-green-600 text-sm" /></div>
                            <span className="text-xs text-amber-900-light/50">Available</span>
                        </div>
                        <p className="text-lg font-bold text-amber-900">{availableTables}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><FaTh className="text-red-600 text-sm" /></div>
                            <span className="text-xs text-amber-900-light/50">Occupied</span>
                        </div>
                        <p className="text-lg font-bold text-amber-900">{occupiedTables}</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><FaUsers className="text-purple-600 text-sm" /></div>
                            <span className="text-xs text-amber-900-light/50">Today's Reservations</span>
                        </div>
                        <p className="text-lg font-bold text-amber-900">{todayRes}</p>
                    </motion.div>
                </div>

                {/* tabs + search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div className="flex bg-orange-50/20 rounded-lg p-1 shrink-0">
                        {['tables', 'reservations'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none ${activeTab === tab ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-900-light/50 hover:text-amber-900'}`}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative max-w-[300px] w-full sm:w-auto">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-sm" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2.5 bg-white border border-warm/50 rounded-lg text-sm focus:outline-none focus:border-secondary transition-colors" />
                    </div>
                </div>

                {/* content */}
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-secondary border-t-transparent" /></div>
                ) : activeTab === 'tables' ? (
                    filteredTables.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-5 text-purple-400"><FaTh className="text-3xl" /></div>
                            <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title">No Tables Found</h3>
                            <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc">Add tables to manage your seating</p>
                            <button onClick={() => { setEditingItem(null); setTableForm({ tableNumber: '', capacity: '', location: 'indoor', status: 'available' }); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200 mt-2"><FaPlus size={14} /> Add Table</button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredTables.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -3, scale: 1.02 }} className={`bg-white rounded-xl shadow-sm border-2 ${getTableStatusColor(t.status)} overflow-hidden transition-all`}>
                                    <div className="p-4 text-center">
                                        <p className="text-2xl font-bold text-amber-900 mb-1">#{t.tableNumber}</p>
                                        <p className="text-[10px] text-amber-900-light/50 mb-2">{t.capacity} seats • {t.location}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getTableStatusColor(t.status)}`}>{t.status}</span>
                                    </div>
                                    <div className="card-actions mt-1 justify-center">
                                        <button onClick={() => openEditTable(t)} className="text-info hover:bg-info/10"><FaEdit size={12} /></button>
                                        <button onClick={() => handleDelete(t.id, 'table')} className="text-danger hover:bg-danger/10"><FaTrash size={12} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    filteredRes.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-400"><FaUsers className="text-3xl" /></div>
                            <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title">No Reservations Found</h3>
                            <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc">Create your first reservation</p>
                            <button onClick={() => { setEditingRes(null); setResForm({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', notes: '' }); setShowResModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200 mt-2"><FaPlus size={14} /> New Reservation</button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredRes.map((r, i) => (
                                <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all">
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-amber-900">{r.customerName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${r.status === 'confirmed' ? 'bg-success/15 text-success' : r.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'}`}>{r.status}</span>
                                        </div>
                                        <div className="text-xs text-amber-900-light/60 space-y-1">
                                            <p>📅 {r.reservationDate?.split('T')[0]} at {r.reservationTime}</p>
                                            <p>👥 Party of {r.partySize} • Table #{r.tableId}</p>
                                            <p>📞 {r.customerPhone}</p>
                                            {r.notes && <p className="text-[10px] text-amber-900-light/40">Note: {r.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => openEditRes(r)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                        <button onClick={() => handleDelete(r.id, 'reservation')} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* table modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingItem ? 'Edit Table' : 'Add Table'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleTableSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Table Number</label><input type="number" value={tableForm.tableNumber} onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Capacity</label><input type="number" value={tableForm.capacity} onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Location</label><select value={tableForm.location} onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="vip">VIP</option></select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Status</label><select value={tableForm.status} onChange={(e) => setTableForm({ ...tableForm, status: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="maintenance">Maintenance</option></select></div>
                                </div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingItem ? 'Update' : 'Add'} Table</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* reservation modal */}
            <AnimatePresence>
                {showResModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingRes ? 'Edit Reservation' : 'New Reservation'}</h2>
                                <button onClick={() => setShowResModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleResSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Customer Name</label><input type="text" value={resForm.customerName} onChange={(e) => setResForm({ ...resForm, customerName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Name" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Phone</label><input type="text" value={resForm.customerPhone} onChange={(e) => setResForm({ ...resForm, customerPhone: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Phone" /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Date</label><input type="date" value={resForm.reservationDate} onChange={(e) => setResForm({ ...resForm, reservationDate: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Time</label><input type="time" value={resForm.reservationTime} onChange={(e) => setResForm({ ...resForm, reservationTime: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Party Size</label><input type="number" min="1" value={resForm.partySize} onChange={(e) => setResForm({ ...resForm, partySize: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Table</label><select value={resForm.tableId} onChange={(e) => setResForm({ ...resForm, tableId: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="">Select Table</option>{tables.map(t => <option key={t.id} value={t.id}>Table #{t.tableNumber}</option>)}</select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Status</label><select value={resForm.status} onChange={(e) => setResForm({ ...resForm, status: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></select></div>
                                </div>
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Notes</label><textarea value={resForm.notes} onChange={(e) => setResForm({ ...resForm, notes: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" rows={2} placeholder="Special requests..." /></div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowResModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingRes ? 'Update' : 'Create'}</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default TableReservationManagement;
