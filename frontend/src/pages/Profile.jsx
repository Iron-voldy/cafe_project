// premium profile page — standalone with Navbar+Footer
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaHistory, FaSave, FaShoppingCart, FaTrash, FaEdit, FaPhone, FaEnvelope, FaShieldAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await API.get('/orders');
            const myOrders = res.data.filter(o => o.customerId === user?.id || o.customerName === `${user?.firstName} ${user?.lastName}`);
            setOrders(myOrders);
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await API.put('/users/profile', profileForm);
            updateUser(profileForm);
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
        finally { setSaving(false); }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        try {
            await API.delete('/users/profile');
            toast.success('Account deleted');
            logout();
            navigate('/');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete account'); }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: FaClock },
            preparing: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: FaClock },
            ready: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: FaCheckCircle },
            completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: FaCheckCircle },
            cancelled: { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', icon: FaTimesCircle }
        };
        const s = styles[status] || styles.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text} border ${s.border}`}>
                <s.icon size={10} /> {status}
            </span>
        );
    };

    const tabs = [
        { key: 'profile', label: 'Profile', icon: FaUser },
        { key: 'orders', label: 'Order History', icon: FaHistory }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FFF8F0] to-[#FFF3E4]">
            <Navbar />

            {/* profile hero banner */}
            <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 relative overflow-hidden">
                {/* decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* avatar */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-amber-900/30 ring-4 ring-white/20">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </motion.div>

                        {/* user info */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                            <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                                <span className="flex items-center gap-1.5 text-amber-200/70 text-sm"><FaEnvelope size={12} /> {user?.email}</span>
                                {user?.phone && <span className="flex items-center gap-1.5 text-amber-200/70 text-sm"><FaPhone size={12} /> {user?.phone}</span>}
                            </div>
                            <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-amber-200 border border-white/20">
                                    <FaShieldAlt size={10} /> {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-300 border border-emerald-400/20">
                                    <FaCheckCircle size={10} /> Active
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* tabs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="-mt-5 relative z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 flex gap-1 max-w-xs">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === tab.key
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* profile form card */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
                                            <p className="text-xs text-gray-400 mt-0.5">Update your personal details</p>
                                        </div>
                                        {!isEditing && (
                                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                                                <FaEdit size={11} /> Edit
                                            </button>
                                        )}
                                    </div>
                                    <form onSubmit={handleProfileSave} className="p-6">
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">First Name</label>
                                                    {isEditing ? (
                                                        <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} required
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all" />
                                                    ) : (
                                                        <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-sm text-gray-900 font-medium border border-transparent">{user?.firstName}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Last Name</label>
                                                    {isEditing ? (
                                                        <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} required
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all" />
                                                    ) : (
                                                        <p className="px-4 py-2.5 bg-gray-50/50 rounded-xl text-sm text-gray-900 font-medium border border-transparent">{user?.lastName}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                                                <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/80 rounded-xl border border-gray-100">
                                                    <FaEnvelope className="text-gray-300" size={14} />
                                                    <span className="text-sm text-gray-400 font-medium">{user?.email}</span>
                                                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">Read only</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                                                        <input type="text" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all" placeholder="+94 7X XXX XXXX" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50/50 rounded-xl border border-transparent">
                                                        <FaPhone className="text-gray-300" size={13} />
                                                        <span className="text-sm text-gray-900 font-medium">{user?.phone || 'Not provided'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
                                                <button type="button" onClick={() => { setIsEditing(false); setProfileForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' }); }}
                                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm cursor-pointer">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={saving}
                                                    className="flex-1 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer">
                                                    <FaSave size={13} /> {saving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </form>
                                </div>
                            </div>

                            {/* side panel */}
                            <div className="space-y-5">
                                {/* account info card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Account Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Account Type</span>
                                            <span className="text-xs font-semibold text-gray-700 capitalize">{user?.role}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Status</span>
                                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><FaCheckCircle size={10} /> Active</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Member Since</span>
                                            <span className="text-xs font-semibold text-gray-700">{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* quick stats */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Stats</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                            <FaShoppingCart className="text-blue-500 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-gray-900">{orders.length || '—'}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Orders</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <FaCalendarAlt className="text-purple-500 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-gray-900">—</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Reservations</p>
                                        </div>
                                    </div>
                                </div>

                                {/* danger zone */}
                                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
                                    <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5"><FaTrash size={11} /> Danger Zone</h3>
                                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                    <button onClick={handleDeleteAccount}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer">
                                        <FaTrash size={11} /> Delete My Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10 border-3 border-amber-600 border-t-transparent" />
                                        <p className="text-sm text-gray-400">Loading orders...</p>
                                    </div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-5">
                                        <FaShoppingCart className="text-blue-400 text-2xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Yet</h3>
                                    <p className="text-sm text-gray-500 max-w-xs">You haven't placed any orders yet. Browse our menu and place your first order!</p>
                                    <button onClick={() => navigate('/browse-menu')} className="mt-5 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-amber-600/20 transition-all text-sm cursor-pointer">
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* orders summary header */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-wrap gap-6 items-center">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-100" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Spent</p>
                                            <p className="text-2xl font-bold text-amber-600">LKR {orders.reduce((s, o) => s + parseFloat(o.totalAmount || 0), 0).toFixed(2)}</p>
                                        </div>
                                        <div className="h-8 w-px bg-gray-100" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Completed</p>
                                            <p className="text-2xl font-bold text-emerald-600">{orders.filter(o => o.status === 'completed').length}</p>
                                        </div>
                                    </div>

                                    {/* order cards */}
                                    {orders.map((order, i) => (
                                        <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                                                            <FaShoppingCart className="text-blue-500 text-sm" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
                                                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                                                <FaCalendarAlt size={9} /> {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                <span className="text-gray-300">•</span>
                                                                {order.orderType}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-bold text-gray-900">LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                                        {getStatusBadge(order.status)}
                                                    </div>
                                                </div>

                                                {order.items && order.items.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-50">
                                                        <div className="grid gap-1.5">
                                                            {order.items.map(item => (
                                                                <div key={item.id} className="flex justify-between items-center text-xs bg-gray-50/70 rounded-lg px-3 py-2">
                                                                    <span className="text-gray-700 font-medium">{item.itemName} <span className="text-gray-400">× {item.quantity}</span></span>
                                                                    <span className="text-gray-900 font-semibold">LKR {parseFloat(item.totalPrice).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
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
