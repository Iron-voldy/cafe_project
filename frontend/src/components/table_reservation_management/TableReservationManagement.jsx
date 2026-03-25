// futuristic dark table & reservation management — preserves all logic
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import API from '../../services/api';
import toast from 'react-hot-toast';

const FieldLabel = ({ icon, children }) => (
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
        {icon && <i className={`fa-solid ${icon} mr-1.5`} style={{ color: 'rgba(0,229,255,0.6)', fontSize: 10 }}></i>}
        {children}
    </label>
);

const ModalBox = ({ title, icon, onClose, children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{ background: '#0d1526', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '1.25rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(168,85,247,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(168,85,247,0.1)', background: 'rgba(168,85,247,0.03)' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#e2eaf7', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`fa-solid ${icon}`} style={{ color: '#a855f7', fontSize: 14 }}></i> {title}
                </h2>
                <button onClick={onClose} style={{ color: '#3d5278', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="hover:text-[#e2eaf7]"><FaXmark size={18} /></button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const TableReservationManagement = () => {
    const [activeTab, setActiveTab] = useState('tables');
    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [tableForm, setTableForm] = useState({ tableNumber: '', seatingCapacity: '', location: 'indoor', status: 'available' });
    const [resForm, setResForm] = useState({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', specialRequests: '' });
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
        try { await API.delete(`/tables/${type === 'table' ? 'tables' : 'reservations'}/${id}`); toast.success('Deleted'); fetchData(); }
        catch { toast.error('Failed to delete'); }
    };

    const openEditTable = (t) => { setEditingItem(t); setTableForm({ tableNumber: t.tableNumber, seatingCapacity: t.seatingCapacity, location: t.location, status: t.status }); setShowModal(true); };
    const openEditRes = (r) => { setEditingRes(r); setResForm({ customerName: r.customerName, customerPhone: r.customerPhone, partySize: r.partySize, reservationDate: r.reservationDate?.split('T')[0], reservationTime: r.reservationTime, status: r.status, tableId: r.tableId, specialRequests: r.specialRequests || '' }); setShowResModal(true); };

    const filteredTables = tables.filter(t => String(t.tableNumber).includes(search) || t.location?.toLowerCase().includes(search.toLowerCase()));
    const filteredRes = reservations.filter(r => r.customerName?.toLowerCase().includes(search.toLowerCase()));

    const tableStatusStyle = (s) => ({
        available: { border: 'rgba(16,185,129,0.3)', badge: 'badge-success', glow: '#10b981', icon: 'fa-circle-check' },
        occupied: { border: 'rgba(239,68,68,0.3)', badge: 'badge-danger', glow: '#ef4444', icon: 'fa-circle-xmark' },
        reserved: { border: 'rgba(245,158,11,0.3)', badge: 'badge-warning', glow: '#f59e0b', icon: 'fa-clock' },
        maintenance: { border: 'rgba(107,132,176,0.3)', badge: 'badge-muted', glow: '#6b84b0', icon: 'fa-wrench' },
    }[s] || { border: 'rgba(107,132,176,0.2)', badge: 'badge-muted', glow: '#6b84b0', icon: 'fa-circle' });

    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const todayRes = reservations.filter(r => { const d = new Date(r.reservationDate); const n = new Date(); return d.toDateString() === n.toDateString(); }).length;

    const resStatusBadge = (s) => ({ confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' }[s] || 'badge-muted');
    const inputCls = 'input-dark';

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
                <div>
                    <h1 className="page-title"><i className="fa-solid fa-calendar-check" style={{ color: '#a855f7', marginRight: 10 }}></i>Tables &amp; Reservations</h1>
                    <p className="page-subtitle">Manage seating layout and customer reservations</p>
                </div>
                <button onClick={() => {
                    if (activeTab === 'tables') { setEditingItem(null); setTableForm({ tableNumber: '', seatingCapacity: '', location: 'indoor', status: 'available' }); setShowModal(true); }
                    else { setEditingRes(null); setResForm({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', specialRequests: '' }); setShowResModal(true); }
                }} className="btn-solid-cyan">
                    <FaPlus style={{ fontSize: 12 }} /> Add {activeTab === 'tables' ? 'Table' : 'Reservation'}
                </button>
            </motion.div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Available', value: availableTables, icon: 'fa-circle-check', color: '#10b981' },
                    { label: 'Occupied', value: occupiedTables, icon: 'fa-circle-xmark', color: '#ef4444' },
                    { label: "Today's Reservations", value: todayRes, icon: 'fa-calendar-day', color: '#a855f7' },
                ].map(({ label, value, icon, color }, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card" style={{ borderColor: `${color}18` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className={`fa-solid ${icon}`} style={{ color, fontSize: 13 }}></i>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#6b84b0', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</span>
                        </div>
                        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#e2eaf7' }}>{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tabs + Search */}
            <div className="section-card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3, border: '1px solid rgba(168,85,247,0.15)' }}>
                        {['tables', 'reservations'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{ padding: '0.4rem 1rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: activeTab === tab ? 'rgba(168,85,247,0.12)' : 'transparent', border: activeTab === tab ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent', color: activeTab === tab ? '#a855f7' : '#6b84b0', transition: 'all 0.2s' }}>
                                <i className={`fa-solid ${tab === 'tables' ? 'fa-chair' : 'fa-calendar-check'} mr-1.5`} style={{ fontSize: 11 }}></i>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 12, pointerEvents: 'none' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className={inputCls} style={{ paddingLeft: '2.5rem', padding: '0.45rem 0.875rem 0.45rem 2.5rem' }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : activeTab === 'tables' ? (
                filteredTables.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-chair" style={{ color: '#a855f7', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Tables Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Add tables to manage your seating layout</p>
                        <button onClick={() => { setEditingItem(null); setTableForm({ tableNumber: '', seatingCapacity: '', location: 'indoor', status: 'available' }); setShowModal(true); }} className="btn-solid-cyan"><FaPlus style={{ fontSize: 11 }} /> Add Table</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                        {filteredTables.map((t, i) => {
                            const style = tableStatusStyle(t.status);
                            return (
                                <motion.div key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4, scale: 1.02 }}
                                    style={{ background: 'rgba(13,21,38,0.7)', border: `2px solid ${style.border}`, borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s', textAlign: 'center' }}>
                                    <div style={{ padding: '1.25rem 0.75rem' }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${style.glow}15`, border: `1px solid ${style.glow}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                            <i className="fa-solid fa-chair" style={{ color: style.glow, fontSize: 20 }}></i>
                                        </div>
                                        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: '#e2eaf7', lineHeight: 1 }}>#{t.tableNumber}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#6b84b0', margin: '4px 0 8px' }}>{t.seatingCapacity} seats &bull; {t.location}</p>
                                        <span className={`badge ${style.badge}`} style={{ fontSize: '0.62rem' }}>{t.status}</span>
                                    </div>
                                    <div className="card-actions" style={{ justifyContent: 'center' }}>
                                        <button onClick={() => openEditTable(t)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.6rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i></button>
                                        <button onClick={() => handleDelete(t.id, 'table')} className="btn-danger" style={{ padding: '0.28rem 0.6rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i></button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            ) : (
                filteredRes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-calendar-check" style={{ color: '#a855f7', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Reservations Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Create your first reservation</p>
                        <button onClick={() => { setEditingRes(null); setResForm({ customerName: '', customerPhone: '', partySize: '', reservationDate: '', reservationTime: '', status: 'confirmed', tableId: '', specialRequests: '' }); setShowResModal(true); }} className="btn-solid-cyan"><FaPlus style={{ fontSize: 11 }} /> New Reservation</button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {filteredRes.map((r, i) => (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                                style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.28)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.12)'}>
                                <div style={{ padding: '1rem 1.125rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2eaf7' }}>{r.customerName}</h3>
                                        <span className={`badge ${resStatusBadge(r.status)}`}>{r.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.78rem', color: '#6b84b0' }}>
                                        <span><i className="fa-solid fa-calendar mr-1.5" style={{ fontSize: 10, color: '#3d5278' }}></i>{r.reservationDate?.split('T')[0]} at {r.reservationTime}</span>
                                        <span><i className="fa-solid fa-users mr-1.5" style={{ fontSize: 10, color: '#3d5278' }}></i>Party of {r.partySize} &bull; Table #{r.tableId}</span>
                                        <span><i className="fa-solid fa-phone mr-1.5" style={{ fontSize: 10, color: '#3d5278' }}></i>{r.customerPhone}</span>
                                        {r.specialRequests && <span style={{ color: '#3d5278', fontSize: '0.72rem', fontStyle: 'italic', marginTop: 2 }}><i className="fa-solid fa-note-sticky mr-1" style={{ fontSize: 9 }}></i>{r.specialRequests}</span>}
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => openEditRes(r)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit</button>
                                    <button onClick={() => handleDelete(r.id, 'reservation')} className="btn-danger" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {/* Table Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalBox title={editingItem ? 'Edit Table' : 'Add Table'} icon="fa-chair" onClose={() => setShowModal(false)}>
                        <form onSubmit={handleTableSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-hashtag">Table Number</FieldLabel><input type="number" value={tableForm.tableNumber} onChange={e => setTableForm({ ...tableForm, tableNumber: e.target.value })} required className={inputCls} /></div>
                                <div><FieldLabel icon="fa-users">Seating Capacity</FieldLabel><input type="number" value={tableForm.seatingCapacity} onChange={e => setTableForm({ ...tableForm, seatingCapacity: e.target.value })} required className={inputCls} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-location-dot">Location</FieldLabel>
                                    <select value={tableForm.location} onChange={e => setTableForm({ ...tableForm, location: e.target.value })} className={inputCls}>
                                        <option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="vip">VIP</option>
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel icon="fa-circle-dot">Status</FieldLabel>
                                    <select value={tableForm.status} onChange={e => setTableForm({ ...tableForm, status: e.target.value })} className={inputCls}>
                                        <option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingItem ? 'Update' : 'Add'} Table</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>

            {/* Reservation Modal */}
            <AnimatePresence>
                {showResModal && (
                    <ModalBox title={editingRes ? 'Edit Reservation' : 'New Reservation'} icon="fa-calendar-check" onClose={() => setShowResModal(false)}>
                        <form onSubmit={handleResSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-user">Customer Name</FieldLabel><input type="text" value={resForm.customerName} onChange={e => setResForm({ ...resForm, customerName: e.target.value })} required className={inputCls} placeholder="Name" /></div>
                                <div><FieldLabel icon="fa-phone">Phone</FieldLabel><input type="text" value={resForm.customerPhone} onChange={e => setResForm({ ...resForm, customerPhone: e.target.value })} required className={inputCls} placeholder="Phone" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-calendar">Date</FieldLabel><input type="date" value={resForm.reservationDate} onChange={e => setResForm({ ...resForm, reservationDate: e.target.value })} required className={inputCls} /></div>
                                <div><FieldLabel icon="fa-clock">Time</FieldLabel><input type="time" value={resForm.reservationTime} onChange={e => setResForm({ ...resForm, reservationTime: e.target.value })} required className={inputCls} /></div>
                                <div><FieldLabel icon="fa-users">Party Size</FieldLabel><input type="number" min="1" value={resForm.partySize} onChange={e => setResForm({ ...resForm, partySize: e.target.value })} required className={inputCls} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-chair">Table</FieldLabel>
                                    <select value={resForm.tableId} onChange={e => setResForm({ ...resForm, tableId: e.target.value })} className={inputCls}>
                                        <option value="">Select Table</option>
                                        {tables.filter(t => t.status === 'available').map(t => <option key={t.id} value={t.id}>Table #{t.tableNumber}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel icon="fa-circle-dot">Status</FieldLabel>
                                    <select value={resForm.status} onChange={e => setResForm({ ...resForm, status: e.target.value })} className={inputCls}>
                                        <option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div><FieldLabel icon="fa-note-sticky">Special Requests</FieldLabel><textarea value={resForm.specialRequests} onChange={e => setResForm({ ...resForm, specialRequests: e.target.value })} className={inputCls} rows={2} placeholder="Special requests..." style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowResModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingRes ? 'Update' : 'Create'} Reservation</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TableReservationManagement;
