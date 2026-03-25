// futuristic dark customer reservation page
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark, FaPlus } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = (s) => ({ confirmed: 'badge-success', cancelled: 'badge-danger', pending: 'badge-warning' }[s] || 'badge-muted');

const CustomerReservation = () => {
    const { user } = useAuth();
    const [tables, setTables] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', partySize: '', reservationDate: '', reservationTime: '', tableId: '', duration: 2, specialRequests: '' });

    useEffect(() => {
        fetchData();
        if (user) {
            setForm(f => ({ ...f, customerName: `${user.firstName} ${user.lastName}`, customerPhone: user.phone || '', customerEmail: user.email || '' }));
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [tabRes, resRes] = await Promise.all([
                API.get('/tables/tables').catch(() => ({ data: [] })),
                // filter by email first (most reliable), fallback to all and filter client-side
                user?.email
                    ? API.get(`/tables/reservations?email=${encodeURIComponent(user.email)}`).catch(() => ({ data: [] }))
                    : API.get('/tables/reservations').catch(() => ({ data: [] }))
            ]);
            setTables(tabRes.data);
            // if no email filter available, match by name as fallback
            const allRes = resRes.data;
            const myRes = user?.email
                ? allRes  // already filtered by email on server
                : allRes.filter(r => r.customerName === `${user?.firstName} ${user?.lastName}`);
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
    const inputCls = 'input-dark';

    const FieldLabel = ({ icon, children }) => (
        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
            {icon && <i className={`fa-solid ${icon}`} style={{ color: 'rgba(0,229,255,0.6)', fontSize: 10, marginRight: 5 }} />}
            {children}
        </label>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070b14', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* Hero */}
            <section style={{ position: 'relative', padding: '4rem 1.25rem 2.5rem', overflow: 'hidden', borderBottom: '1px solid rgba(168,85,247,0.08)', minHeight: 220, display: 'flex', alignItems: 'center' }}>
                {/* Wallpaper */}
                <img src="/assets/cafe_reservation.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,20,0.65) 0%, rgba(7,11,20,0.95) 100%)', pointerEvents: 'none' }} />
                <div className="hud-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.3rem 0.875rem', borderRadius: 99, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)', marginBottom: '1rem' }}>
                            <i className="fa-solid fa-calendar-check" style={{ color: '#a855f7', fontSize: 11 }} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a855f7', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Table Reservations</span>
                        </div>
                        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#e2eaf7', marginBottom: '0.5rem' }}>
                            Reserve Your <span style={{ background: 'linear-gradient(90deg, #a855f7, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Table</span>
                        </h1>
                        <p style={{ color: 'rgba(194,211,240,0.75)', fontSize: '0.9rem' }}>Book a seat for your next visit and enjoy a seamless dining experience</p>
                    </motion.div>
                </div>
            </section>

            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '2rem 1.25rem 4rem', flex: 1 }}>

                {/* Available Tables Preview */}
                {availableTables.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                            <span className="dot-live" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                            <h2 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Tables</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                            {availableTables.slice(0, 8).map(t => (
                                <div key={t.id} style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '0.75rem', padding: '0.875rem', textAlign: 'center' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                        <i className="fa-solid fa-chair" style={{ color: '#10b981', fontSize: 14 }} />
                                    </div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2d3f0' }}>Table {t.tableNumber}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#3d5278', marginTop: 2 }}>{t.seatingCapacity} seats{t.location ? ` • ${t.location}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* My Reservations Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div>
                        <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#e2eaf7' }}>My Reservations</h2>
                        {!loading && <p style={{ fontSize: '0.72rem', color: '#3d5278', marginTop: 2 }}>{reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found</p>}
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-solid-cyan">
                        <FaPlus style={{ fontSize: 12 }} /> Book a Table
                    </button>
                </div>

                {/* Reservations List */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                ) : reservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(13,21,38,0.5)', border: '1px solid rgba(168,85,247,0.08)', borderRadius: '1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-calendar-xmark" style={{ color: '#3d5278', fontSize: 26 }} />
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Reservations</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Book a table to get started</p>
                        <button onClick={() => setShowModal(true)} className="btn-solid-cyan">
                            <FaPlus style={{ fontSize: 12 }} /> Book a Table
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {reservations.map((r, i) => (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(168,85,247,0.1)', borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.1)'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <i className="fa-solid fa-calendar-check" style={{ color: '#a855f7', fontSize: 16 }} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c2d3f0' }}>Table #{r.tableId}</p>
                                        <p style={{ fontSize: '0.72rem', color: '#3d5278', marginTop: 2 }}>
                                            <i className="fa-regular fa-calendar" style={{ marginRight: 5 }} />
                                            {new Date(r.reservationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                                            <i className="fa-regular fa-clock" style={{ marginRight: 5 }} />
                                            {r.reservationTime}
                                            <span style={{ margin: '0 6px', opacity: 0.4 }}>•</span>
                                            <i className="fa-solid fa-users" style={{ marginRight: 5 }} />
                                            {r.partySize} guests
                                        </p>
                                        {r.specialRequests && <p style={{ fontSize: '0.68rem', color: '#6b84b0', marginTop: 3 }}><i className="fa-solid fa-note-sticky" style={{ marginRight: 4 }} />{r.specialRequests}</p>}
                                    </div>
                                </div>
                                <span className={`badge ${statusBadge(r.status)}`} style={{ textTransform: 'capitalize' }}>{r.status}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
                        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                            style={{ background: '#0d1526', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '1.25rem', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(168,85,247,0.1)' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(168,85,247,0.08)', background: 'rgba(168,85,247,0.03)' }}>
                                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#e2eaf7', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <i className="fa-solid fa-calendar-plus" style={{ color: '#a855f7', fontSize: 14 }} /> Book a Table
                                </h2>
                                <button onClick={() => setShowModal(false)} style={{ color: '#3d5278', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    <FaXmark size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Name + Phone */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <FieldLabel icon="fa-user">Your Name</FieldLabel>
                                        <input type="text" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required className={inputCls} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <FieldLabel icon="fa-phone">Phone</FieldLabel>
                                        <input type="text" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} required className={inputCls} placeholder="+94 71 234 5678" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <FieldLabel icon="fa-envelope">Email {user ? <span style={{ color: '#3d5278', fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>(auto-filled)</span> : ''}</FieldLabel>
                                    <input
                                        type="email"
                                        value={form.customerEmail}
                                        onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                                        className={inputCls}
                                        placeholder="your@email.com"
                                        readOnly={!!user}
                                        style={user ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                                    />
                                </div>


                                {/* Date + Time */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <FieldLabel icon="fa-calendar">Date</FieldLabel>
                                        <input type="date" value={form.reservationDate} onChange={e => setForm({ ...form, reservationDate: e.target.value })} required className={inputCls} min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div>
                                        <FieldLabel icon="fa-clock">Time</FieldLabel>
                                        <input type="time" value={form.reservationTime} onChange={e => setForm({ ...form, reservationTime: e.target.value })} required className={inputCls} />
                                    </div>
                                </div>

                                {/* Party Size + Table */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                        <FieldLabel icon="fa-users">Party Size</FieldLabel>
                                        <input type="number" min="1" max="20" value={form.partySize} onChange={e => setForm({ ...form, partySize: e.target.value })} required className={inputCls} placeholder="e.g. 4" />
                                    </div>
                                    <div>
                                        <FieldLabel icon="fa-chair">Table</FieldLabel>
                                        <select value={form.tableId} onChange={e => setForm({ ...form, tableId: e.target.value })} required className={inputCls}>
                                            <option value="">Select table</option>
                                            {availableTables.map(t => (
                                                <option key={t.id} value={t.id}>Table {t.tableNumber} ({t.seatingCapacity} seats{t.location ? `, ${t.location}` : ''})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div>
                                    <FieldLabel icon="fa-note-sticky">Special Requests</FieldLabel>
                                    <textarea value={form.specialRequests} onChange={e => setForm({ ...form, specialRequests: e.target.value })}
                                        className={inputCls} rows={2} placeholder="Any dietary preferences, celebrations, or other requests..."
                                        style={{ resize: 'vertical', minHeight: 60 }} />
                                </div>

                                <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.25rem', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(168,85,247,0.3)', transition: 'all 0.2s' }}>
                                        <i className="fa-solid fa-calendar-check" style={{ fontSize: 13 }} /> Confirm Booking
                                    </button>
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
