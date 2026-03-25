// futuristic dark profile page — preserves all logic
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = (s) => ({ pending: 'badge-warning', preparing: 'badge-info', ready: 'badge-purple', completed: 'badge-success', cancelled: 'badge-danger' }[s] || 'badge-muted');

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    }, [user]);

    useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab]);
    useEffect(() => { if (activeTab === 'reservations') fetchReservations(); }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await API.get('/orders');
            const myOrders = res.data.filter(o => o.customerId === user?.id || o.customerName === `${user?.firstName} ${user?.lastName}`);
            setOrders(myOrders);
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const fetchReservations = async () => {
        setLoading(true);
        try {
            // filter by customer email (unauthenticated bookings use email as key)
            const res = await API.get(`/tables/reservations?email=${encodeURIComponent(user?.email)}`);
            setReservations(res.data);
        } catch { toast.error('Failed to load reservations'); }
        finally { setLoading(false); }
    };

    const cancelReservation = async (id) => {
        if (!confirm('Cancel this reservation?')) return;
        try {
            await API.put(`/tables/reservations/${id}`, { status: 'cancelled' });
            toast.success('Reservation cancelled');
            fetchReservations();
        } catch { toast.error('Failed to cancel reservation'); }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault(); setSaving(true);
        try { await API.put('/users/profile', profileForm); updateUser(profileForm); toast.success('Profile updated'); setIsEditing(false); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
        finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Delete your account? This cannot be undone.')) return;
        try { await API.delete('/users/profile'); toast.success('Account deleted'); logout(); navigate('/'); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed to delete account'); }
    };

    const totalSpent = orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070b14', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* Profile banner */}
            <div style={{ background: 'linear-gradient(135deg, #0d1526 0%, #050a14 100%)', borderBottom: '1px solid rgba(0,229,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 70% 50%, rgba(0,229,255,0.06), transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.04), transparent 50%)' }} />
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #00e5ff30, #00e5ff10)', border: '2px solid rgba(0,229,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: '#00e5ff', boxShadow: '0 0 30px rgba(0,229,255,0.15)', flexShrink: 0 }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#e2eaf7' }}>{user?.firstName} {user?.lastName}</h1>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b84b0', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <i className="fa-solid fa-envelope" style={{ fontSize: 11, color: '#3d5278' }}></i>{user?.email}
                                </span>
                                {user?.phone && <span style={{ fontSize: '0.8rem', color: '#6b84b0', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <i className="fa-solid fa-phone" style={{ fontSize: 11, color: '#3d5278' }}></i>{user?.phone}
                                </span>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: 99, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff', fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <i className="fa-solid fa-shield-halved" style={{ fontSize: 9 }}></i>{user?.role}
                                </span>
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: 99, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <i className="fa-solid fa-circle-check" style={{ fontSize: 9 }}></i>Active
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 1.5rem 0', width: '100%' }}>
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3, border: '1px solid rgba(0,229,255,0.1)', width: 'fit-content', gap: 2 }}>
                    {[
                        { key: 'profile', icon: 'fa-user', label: 'Profile' },
                        { key: 'orders', icon: 'fa-cart-shopping', label: 'Order History' },
                        { key: 'reservations', icon: 'fa-calendar-check', label: 'My Bookings' }
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            style={{ padding: '0.5rem 1.25rem', borderRadius: 6, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7, background: activeTab === tab.key ? 'rgba(0,229,255,0.12)' : 'transparent', border: activeTab === tab.key ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent', color: activeTab === tab.key ? '#00e5ff' : '#6b84b0' }}>
                            <i className={`fa-solid ${tab.icon}`} style={{ fontSize: 12 }}></i>{tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem', flex: 1, width: '100%' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
                                {/* Form */}
                                <div style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(0,229,255,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(0,229,255,0.07)', background: 'rgba(0,229,255,0.02)' }}>
                                        <div>
                                            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2eaf7' }}>Personal Information</h2>
                                            <p style={{ fontSize: '0.72rem', color: '#3d5278', marginTop: 2 }}>Update your personal details</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.35rem 0.875rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff', transition: 'all 0.2s' }}>
                                                <i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleProfileSave} style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                {[['firstName', 'First Name', 'fa-user'], ['lastName', 'Last Name', 'fa-user']].map(([field, label, icon]) => (
                                                    <div key={field}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                                                            <i className={`fa-solid ${icon} mr-1`} style={{ color: 'rgba(0,229,255,0.5)', fontSize: 9 }}></i>{label}
                                                        </label>
                                                        {isEditing ? (
                                                            <input type="text" value={profileForm[field]} onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })} required className="input-dark" />
                                                        ) : (
                                                            <p style={{ padding: '0.6rem 0.875rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#c2d3f0', fontWeight: 600 }}>{user?.[field]}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                                                    <i className="fa-solid fa-envelope mr-1" style={{ color: 'rgba(0,229,255,0.5)', fontSize: 9 }}></i>Email Address
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.875rem', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,229,255,0.05)', borderRadius: 8 }}>
                                                    <i className="fa-solid fa-envelope" style={{ color: '#3d5278', fontSize: 12 }}></i>
                                                    <span style={{ fontSize: '0.85rem', color: '#3d5278', fontWeight: 500 }}>{user?.email}</span>
                                                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#3d5278', background: 'rgba(61,82,120,0.2)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>Read only</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                                                    <i className="fa-solid fa-phone mr-1" style={{ color: 'rgba(0,229,255,0.5)', fontSize: 9 }}></i>Phone Number
                                                </label>
                                                {isEditing ? (
                                                    <div style={{ position: 'relative' }}>
                                                        <i className="fa-solid fa-phone" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 11 }}></i>
                                                        <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-dark" style={{ paddingLeft: '2.5rem' }} placeholder="+94 7X XXX XXXX" />
                                                    </div>
                                                ) : (
                                                    <p style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.875rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.85rem', color: '#c2d3f0', fontWeight: 600 }}>
                                                        <i className="fa-solid fa-phone" style={{ color: '#3d5278', fontSize: 11 }}></i>
                                                        {user?.phone || 'Not provided'}
                                                    </p>
                                                )}
                                            </div>

                                            {isEditing && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                    style={{ display: 'flex', gap: 10, paddingTop: '0.5rem', borderTop: '1px solid rgba(0,229,255,0.07)' }}>
                                                    <button type="button" onClick={() => { setIsEditing(false); setProfileForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' }); }}
                                                        className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                                    <button type="submit" disabled={saving} className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>
                                                        <i className="fa-solid fa-floppy-disk" style={{ fontSize: 12 }}></i>
                                                        {saving ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Side panel */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Account info */}
                                    <div style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(0,229,255,0.1)', borderRadius: '1rem', padding: '1.125rem' }}>
                                        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#c2d3f0', marginBottom: '0.875rem', borderBottom: '1px solid rgba(0,229,255,0.07)', paddingBottom: '0.5rem' }}>
                                            <i className="fa-solid fa-id-card mr-2" style={{ color: '#00e5ff', fontSize: 12 }}></i>Account Details
                                        </h3>
                                        {[
                                            { label: 'Account Type', value: user?.role, capitalize: true },
                                            { label: 'Status', value: 'Active', color: '#10b981' },
                                            { label: 'Member Since', value: new Date().toLocaleDateString() },
                                        ].map(({ label, value, capitalize, color }) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(0,229,255,0.04)' }}>
                                                <span style={{ fontSize: '0.75rem', color: '#3d5278' }}>{label}</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color || '#c2d3f0', textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Danger zone */}
                                    <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '1rem', padding: '1.125rem' }}>
                                        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 12 }}></i>Danger Zone
                                        </h3>
                                        <p style={{ fontSize: '0.72rem', color: '#6b84b0', marginBottom: '0.875rem', lineHeight: 1.5 }}>Permanently delete your account and all data. This cannot be undone.</p>
                                        <button onClick={handleDeleteAccount}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <i className="fa-solid fa-trash" style={{ fontSize: 11 }}></i> Delete My Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'reservations' ? (
                        <motion.div key="reservations" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
                                </div>
                            ) : reservations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '1rem' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                        <i className="fa-solid fa-calendar-xmark" style={{ color: '#f59e0b', fontSize: 24 }} />
                                    </div>
                                    <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Reservations Yet</h3>
                                    <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Book a table to see your reservations here</p>
                                    <button onClick={() => navigate('/reservations')} className="btn-solid-cyan" style={{ display: 'inline-flex' }}>Book a Table</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Summary */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {[
                                            { label: 'Total Bookings', value: reservations.length, icon: 'fa-calendar', color: '#f59e0b' },
                                            { label: 'Confirmed', value: reservations.filter(r => r.status === 'confirmed').length, icon: 'fa-circle-check', color: '#10b981' },
                                            { label: 'Upcoming', value: reservations.filter(r => r.status !== 'cancelled' && r.status !== 'completed' && new Date(`${r.reservationDate}T${r.reservationTime}`) >= new Date()).length, icon: 'fa-clock', color: '#00e5ff' },
                                        ].map(({ label, value, icon, color }) => (
                                            <div key={label} style={{ background: 'rgba(13,21,38,0.8)', border: `1px solid ${color}15`, borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <i className={`fa-solid ${icon}`} style={{ color, fontSize: 13 }} />
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.65rem', color: '#3d5278', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</p>
                                                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#e2eaf7', marginTop: 2 }}>{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reservation cards */}
                                    {reservations.map((res, i) => {
                                        const resBadge = (s) => ({ confirmed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger', completed: 'badge-info' }[s] || 'badge-muted');
                                        const isCancellable = res.status !== 'cancelled' && res.status !== 'completed';
                                        return (
                                            <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                                style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                                                <div style={{ padding: '1rem 1.125rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <i className="fa-solid fa-calendar-check" style={{ color: '#f59e0b', fontSize: 13 }} />
                                                            </div>
                                                            <div>
                                                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2d3f0' }}>{res.reservationNumber}</p>
                                                                <p style={{ fontSize: '0.72rem', color: '#3d5278', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                                                    <i className="fa-solid fa-calendar" style={{ fontSize: 9 }} />
                                                                    {new Date(res.reservationDate).toLocaleDateString('en-LK', { weekday: 'short', month: 'short', day: 'numeric' })} at {res.reservationTime?.slice(0,5)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`badge ${resBadge(res.status)}`} style={{ fontSize: '0.62rem', flexShrink: 0 }}>{res.status}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                                                        {[
                                                            { icon: 'fa-chair', label: 'Table', value: res.table ? `Table ${res.table.tableNumber}` : `Table #${res.tableId}` },
                                                            { icon: 'fa-users', label: 'Guests', value: `${res.partySize} person${res.partySize > 1 ? 's' : ''}` },
                                                            { icon: 'fa-hourglass-half', label: 'Duration', value: `${res.duration || 1}h` },
                                                        ].map(({ icon, label, value }) => (
                                                            <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
                                                                <p style={{ fontSize: '0.6rem', color: '#3d5278', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 2 }}>
                                                                    <i className={`fa-solid ${icon}`} style={{ fontSize: 8, marginRight: 3 }} />{label}
                                                                </p>
                                                                <p style={{ fontSize: '0.78rem', color: '#c2d3f0', fontWeight: 600 }}>{value}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {res.specialRequests && (
                                                        <p style={{ marginTop: 8, fontSize: '0.72rem', color: '#6b84b0', display: 'flex', alignItems: 'flex-start', gap: 6, background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
                                                            <i className="fa-solid fa-note-sticky" style={{ fontSize: 9, marginTop: 2, color: '#3d5278', flexShrink: 0 }} />
                                                            {res.specialRequests}
                                                        </p>
                                                    )}
                                                    {isCancellable && (
                                                        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => cancelReservation(res.id)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.3rem 0.875rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', transition: 'all 0.2s' }}>
                                                                <i className="fa-solid fa-xmark" style={{ fontSize: 10 }} /> Cancel Booking
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="orders" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', animation: 'spin 0.8s linear infinite' }} />
                                </div>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: '1rem' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                                        <i className="fa-solid fa-cart-shopping" style={{ color: '#3d5278', fontSize: 24 }}></i>
                                    </div>
                                    <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Orders Yet</h3>
                                    <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Browse our menu and place your first order</p>
                                    <button onClick={() => navigate('/browse-menu')} className="btn-solid-cyan" style={{ display: 'inline-flex' }}>Browse Menu</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Summary */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {[
                                            { label: 'Total Orders', value: orders.length, icon: 'fa-cart-shopping', color: '#00e5ff' },
                                            { label: 'Total Spent', value: `LKR ${totalSpent.toFixed(2)}`, icon: 'fa-coins', color: '#f59e0b' },
                                            { label: 'Completed', value: completedOrders, icon: 'fa-circle-check', color: '#10b981' },
                                        ].map(({ label, value, icon, color }) => (
                                            <div key={label} style={{ background: 'rgba(13,21,38,0.8)', border: `1px solid ${color}15`, borderRadius: '0.875rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <i className={`fa-solid ${icon}`} style={{ color, fontSize: 13 }}></i>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.65rem', color: '#3d5278', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</p>
                                                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#e2eaf7', marginTop: 2 }}>{value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order cards */}
                                    {orders.map((order, i) => (
                                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                                            <div style={{ padding: '1rem 1.125rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <i className="fa-solid fa-cart-shopping" style={{ color: '#00e5ff', fontSize: 13 }}></i>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2d3f0' }}>{order.orderNumber}</p>
                                                            <p style={{ fontSize: '0.72rem', color: '#3d5278', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <i className="fa-solid fa-calendar" style={{ fontSize: 9 }}></i>
                                                                {new Date(order.createdAt).toLocaleDateString()} &bull; {order.orderType}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                                        <span className={`badge ${statusBadge(order.status)}`} style={{ fontSize: '0.62rem' }}>{order.status}</span>
                                                    </div>
                                                </div>
                                                {order.items && order.items.length > 0 && (
                                                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(0,229,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        {order.items.map(item => (
                                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                                <span style={{ color: '#c2d3f0' }}>{item.itemName} <span style={{ color: '#3d5278' }}>×{item.quantity}</span></span>
                                                                <span style={{ color: '#6b84b0', fontWeight: 600 }}>LKR {parseFloat(item.totalPrice).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
