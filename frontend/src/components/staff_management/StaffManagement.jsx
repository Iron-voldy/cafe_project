// Staff management - admin only page to manage users
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaUserShield, FaUserTie, FaUser, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../services/api';

const StaffManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'staff' });
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        try {
            const res = await API.get('/users/all');
            setUsers(res.data);
        } catch { toast.error('Failed to fetch users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                const { password, email, ...updateData } = formData;
                await API.put(`/users/${editingUser.id}`, updateData);
                toast.success('User updated successfully');
            } else {
                await API.post('/users/register', formData);
                toast.success('User created successfully');
            }
            fetchUsers();
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await API.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch { toast.error('Failed to delete user'); }
    };

    const handleToggleActive = async (user) => {
        try {
            await API.put(`/users/${user.id}`, { ...user, isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch { toast.error('Failed to update user status'); }
    };

    const openCreate = () => {
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'staff' });
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', phone: user.phone || '', role: user.role });
        setShowModal(true);
    };

    const filteredUsers = users.filter(u => {
        const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const getRoleIcon = (role) => {
        if (role === 'admin') return <FaUserShield className="text-red-500" />;
        if (role === 'staff') return <FaUserTie className="text-blue-500" />;
        return <FaUser className="text-gray-500" />;
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-red-100 text-red-700',
            staff: 'bg-blue-100 text-blue-700',
            customer: 'bg-gray-100 text-gray-600'
        };
        return styles[role] || styles.customer;
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        staff: users.filter(u => u.role === 'staff').length,
        customers: users.filter(u => u.role === 'customer').length,
        active: users.filter(u => u.isActive).length
    };

    return (
        <>
            {/* header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><FaUsers className="text-amber-600" /> Staff Management</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Manage users, roles, and access permissions.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer">
                    <FaPlus size={15} /> Add Staff
                </button>
            </motion.div>

            {/* stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                    { label: 'Total Users', value: stats.total, color: 'bg-gray-100 text-gray-700' },
                    { label: 'Admins', value: stats.admins, color: 'bg-red-50 text-red-700' },
                    { label: 'Staff', value: stats.staff, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Customers', value: stats.customers, color: 'bg-green-50 text-green-700' },
                    { label: 'Active', value: stats.active, color: 'bg-amber-50 text-amber-700' }
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`${stat.color} rounded-xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                        <p className="text-xs font-medium mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* search and filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div className="flex gap-2">
                    {['all', 'admin', 'staff', 'customer'].map(role => (
                        <button key={role} onClick={() => setRoleFilter(role)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${roleFilter === role ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* users table */}
            {filteredUsers.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <FaUsers className="text-2xl" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">No Users Found</h3>
                    <p className="text-sm text-gray-500 mb-4">No users match your search criteria</p>
                    <button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                        <FaPlus size={14} /> Add Staff
                    </button>
                </motion.div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredUsers.map((user, i) => (
                                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] text-gray-400">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-5 py-3.5 text-sm text-gray-600">{user.phone || '—'}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                                                {getRoleIcon(user.role)} {user.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => handleToggleActive(user)} className="cursor-pointer" title={user.isActive ? 'Deactivate' : 'Activate'}>
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><FaToggleOn size={18} /> Active</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-medium"><FaToggleOff size={18} /> Inactive</span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><FaEdit size={14} /></button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FaTrash size={14} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">{editingUser ? 'Edit User' : 'Add Staff Member'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                        <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="First name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                        <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Last name" />
                                    </div>
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="email@example.com" />
                                    </div>
                                )}
                                {!editingUser && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Min 6 characters" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="Phone number" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                            <option value="customer">Customer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-transparent border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors">{editingUser ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StaffManagement;
