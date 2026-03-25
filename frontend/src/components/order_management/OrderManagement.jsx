// futuristic dark order management — preserves all logic
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaXmark, FaMinus } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
    const m = { pending: 'badge-warning', preparing: 'badge-info', ready: 'badge-purple', completed: 'badge-success', cancelled: 'badge-danger' };
    return m[s] || 'badge-muted';
};

const FieldLabel = ({ icon, children }) => (
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
        {icon && <i className={`fa-solid ${icon} mr-1.5`} style={{ color: 'rgba(0,229,255,0.6)', fontSize: 10 }}></i>}
        {children}
    </label>
);

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({ customerId: '', customerName: '', orderType: 'dine-in', tableNumber: '', status: 'pending', notes: '' });
    const [itemForm, setItemForm] = useState({ menuItemId: '', itemName: '', quantity: 1, unitPrice: '', specialRequest: '' });
    const [orderItems, setOrderItems] = useState([]);
    const [showQuickCustomer, setShowQuickCustomer] = useState(false);
    const [quickCustForm, setQuickCustForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [ordRes, custRes, menuRes, tabRes] = await Promise.all([
                API.get('/orders').catch(() => ({ data: [] })),
                API.get('/users/all').catch(() => ({ data: [] })),
                API.get('/menu/items').catch(() => ({ data: [] })),
                API.get('/tables/tables').catch(() => ({ data: [] }))
            ]);
            setOrders(ordRes.data);
            setCustomers(custRes.data.filter(c => c.role === 'customer'));
            setMenuItems(menuRes.data.filter(m => m.isAvailable));
            setTables(tabRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { customerId: formData.customerId || null, customerName: formData.customerName, orderType: formData.orderType, tableNumber: formData.orderType === 'dine-in' ? (formData.tableNumber || null) : null, status: formData.status, notes: formData.notes };
            if (editingOrder) { await API.put(`/orders/${editingOrder.id}`, payload); toast.success('Order updated'); }
            else {
                const res = await API.post('/orders', payload);
                const orderId = res.data.id || res.data.order?.id;
                if (orderId && orderItems.length > 0) {
                    for (const item of orderItems) {
                        await API.post('/orders/items', { orderId, itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.quantity * item.unitPrice, specialInstructions: item.specialRequest || '' });
                    }
                }
                toast.success('Order created');
            }
            fetchAll(); setShowModal(false); resetForm();
        } catch { toast.error('Failed to save order'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this order?')) return;
        try { await API.delete(`/orders/${id}`); toast.success('Order deleted'); fetchAll(); }
        catch { toast.error('Failed to delete'); }
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { itemName: itemForm.itemName, quantity: itemForm.quantity, unitPrice: itemForm.unitPrice, totalPrice: itemForm.quantity * itemForm.unitPrice, specialInstructions: itemForm.specialRequest };
            if (editingItem) { await API.put(`/orders/items/${editingItem.id}`, payload); toast.success('Item updated'); }
            else { await API.post('/orders/items', { ...payload, orderId: selectedOrder.id }); toast.success('Item added'); }
            fetchAll(); setShowItemModal(false);
        } catch { toast.error('Failed to save item'); }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Delete this item?')) return;
        try { await API.delete(`/orders/items/${itemId}`); toast.success('Item deleted'); fetchAll(); }
        catch { toast.error('Failed to delete item'); }
    };

    const handleQuickAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await API.post('/users/register', { ...quickCustForm, role: 'customer' });
            toast.success('Customer created');
            const custRes = await API.get('/users/all').catch(() => ({ data: [] }));
            const filtered = custRes.data.filter(c => c.role === 'customer');
            setCustomers(filtered);
            const newCust = filtered.find(c => c.email === quickCustForm.email);
            if (newCust) setFormData(f => ({ ...f, customerId: newCust.id, customerName: `${newCust.firstName} ${newCust.lastName}` }));
            setShowQuickCustomer(false);
            setQuickCustForm({ firstName: '', lastName: '', email: '', password: '', phone: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create customer'); }
    };

    const selectCustomer = (custId) => {
        const cust = customers.find(c => c.id === parseInt(custId));
        if (cust) setFormData(f => ({ ...f, customerId: cust.id, customerName: `${cust.firstName} ${cust.lastName}` }));
        else setFormData(f => ({ ...f, customerId: '', customerName: '' }));
    };

    const selectMenuItem = (menuId) => {
        const item = menuItems.find(m => m.id === parseInt(menuId));
        if (item) setItemForm(f => ({ ...f, menuItemId: item.id, itemName: item.name, unitPrice: parseFloat(item.price) }));
        else setItemForm(f => ({ ...f, menuItemId: '', itemName: '', unitPrice: '' }));
    };

    const addItemToOrder = () => {
        if (!itemForm.itemName || !itemForm.unitPrice || itemForm.quantity < 1) return;
        setOrderItems(prev => [...prev, { ...itemForm, id: Date.now() }]);
        setItemForm({ menuItemId: '', itemName: '', quantity: 1, unitPrice: '', specialRequest: '' });
    };

    const removeItemFromOrder = (id) => setOrderItems(prev => prev.filter(i => i.id !== id));
    const resetForm = () => { setFormData({ customerId: '', customerName: '', orderType: 'dine-in', tableNumber: '', status: 'pending', notes: '' }); setOrderItems([]); };
    const openEdit = (order) => { setEditingOrder(order); setFormData({ customerId: order.customerId || '', customerName: order.customerName, orderType: order.orderType, tableNumber: order.tableNumber || '', status: order.status, notes: order.notes || '' }); setOrderItems([]); setShowModal(true); };
    const openAddItem = (order) => { setSelectedOrder(order); setEditingItem(null); setItemForm({ menuItemId: '', itemName: '', quantity: 1, unitPrice: '', specialRequest: '' }); setShowItemModal(true); };
    const openEditItem = (item) => { setEditingItem(item); setItemForm({ menuItemId: '', itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice, specialRequest: item.specialInstructions || '' }); setShowItemModal(true); };

    const filteredOrders = orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase()));
    const orderItemsTotal = orderItems.reduce((s, i) => s + i.quantity * parseFloat(i.unitPrice || 0), 0);

    const st = { fontFamily: "'Inter', sans-serif" };
    const inputCls = 'input-dark';

    const ModalBox = ({ title, icon, onClose, children }) => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                style={{ background: '#0d1526', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '1.25rem', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(0,229,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,229,255,0.08)', background: 'rgba(0,229,255,0.03)' }}>
                    <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#e2eaf7', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className={`fa-solid ${icon}`} style={{ color: '#00e5ff', fontSize: 14 }}></i> {title}
                    </h2>
                    <button onClick={onClose} style={{ color: '#3d5278', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="hover:text-[#e2eaf7]">
                        <FaXmark size={18} />
                    </button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );

    return (
        <div style={st}>
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
                <div>
                    <h1 className="page-title"><i className="fa-solid fa-cart-shopping" style={{ color: '#00e5ff', marginRight: 10 }}></i>Order Management</h1>
                    <p className="page-subtitle">Manage all cafe orders, statuses and items</p>
                </div>
                <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="btn-solid-cyan">
                    <FaPlus style={{ fontSize: 12 }} /> New Order
                </button>
            </motion.div>

            {/* Search */}
            <div className="section-card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 12, pointerEvents: 'none' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order # or customer..." className={inputCls} style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <div className="badge badge-info"><span className="dot-live" style={{ width: 5, height: 5 }}></span>{orders.length} Orders</div>
                </div>
            </div>

            {/* Orders grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                        <i className="fa-solid fa-cart-shopping" style={{ color: '#3d5278', fontSize: 24 }}></i>
                    </div>
                    <h3 style={{ color: '#c2d3f0', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>No Orders Found</h3>
                    <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Start by creating your first order</p>
                    <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="btn-solid-cyan">
                        <FaPlus style={{ fontSize: 12 }} /> New Order
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {filteredOrders.map((order, i) => (
                        <motion.div key={order.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                            style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(0,229,255,0.1)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)'}>
                            <div style={{ padding: '1rem 1.125rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00e5ff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.04em' }}>{order.orderNumber}</h3>
                                    <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <div style={{ display: 'flex', gap: 6, fontSize: '0.77rem', color: '#6b84b0' }}>
                                        <i className="fa-solid fa-user" style={{ fontSize: 11, marginTop: 1, color: '#3d5278' }}></i>
                                        <span style={{ color: '#c2d3f0' }}>{order.customerName}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16, fontSize: '0.77rem', color: '#6b84b0' }}>
                                        <span><i className="fa-solid fa-utensils" style={{ marginRight: 5, color: '#3d5278', fontSize: 10 }}></i>{order.orderType}</span>
                                        {order.tableNumber && <span><i className="fa-solid fa-chair" style={{ marginRight: 4, color: '#3d5278', fontSize: 10 }}></i>Table #{order.tableNumber}</span>}
                                    </div>
                                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#e2eaf7', marginTop: 4 }}>LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                </div>

                                {order.items && order.items.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,229,255,0.07)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <span style={{ fontSize: '0.68rem', color: '#3d5278', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Items ({order.items.length})</span>
                                            <button onClick={() => openAddItem(order)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00e5ff', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FaPlus style={{ fontSize: 10 }} /> Add
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                            {order.items.slice(0, 3).map(item => (
                                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '0.3rem 0.5rem', fontSize: '0.72rem' }}>
                                                    <span style={{ color: '#c2d3f0' }}>{item.itemName} ×{item.quantity}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ color: '#6b84b0' }}>LKR {parseFloat(item.totalPrice).toFixed(2)}</span>
                                                        <button onClick={() => openEditItem(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00e5ff', fontSize: 10 }}><i className="fa-solid fa-pen"></i></button>
                                                        <button onClick={() => handleDeleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 10 }}><i className="fa-solid fa-trash"></i></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && <p style={{ fontSize: '0.68rem', color: '#3d5278', textAlign: 'center' }}>+{order.items.length - 3} more</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-actions">
                                <button onClick={() => openEdit(order)} className="btn-neon-cyan" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>
                                    <i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit
                                </button>
                                <button onClick={() => openAddItem(order)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', transition: 'all 0.2s' }}>
                                    <FaPlus style={{ fontSize: 10 }} /> Item
                                </button>
                                {(order.status === 'completed' || order.status === 'ready') && (
                                    <button onClick={() => navigate('/payments')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.3rem 0.7rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', transition: 'all 0.2s' }}>
                                        <i className="fa-solid fa-credit-card" style={{ fontSize: 10 }}></i> Pay
                                    </button>
                                )}
                                <button onClick={() => handleDelete(order.id)} className="btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem' }}>
                                    <i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Order Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalBox title={editingOrder ? 'Edit Order' : 'New Order'} icon="fa-cart-shopping" onClose={() => setShowModal(false)}>
                        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Customer */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <FieldLabel icon="fa-user">Customer</FieldLabel>
                                    <button type="button" onClick={() => setShowQuickCustomer(!showQuickCustomer)}
                                        style={{ fontSize: '0.7rem', color: '#00e5ff', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <i className="fa-solid fa-user-plus" style={{ fontSize: 10 }}></i> {showQuickCustomer ? 'Cancel' : 'New Customer'}
                                    </button>
                                </div>
                                {showQuickCustomer ? (
                                    <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)', borderRadius: 8, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <input type="text" placeholder="First name" value={quickCustForm.firstName} onChange={e => setQuickCustForm({ ...quickCustForm, firstName: e.target.value })} required className={inputCls} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }} />
                                            <input type="text" placeholder="Last name" value={quickCustForm.lastName} onChange={e => setQuickCustForm({ ...quickCustForm, lastName: e.target.value })} required className={inputCls} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }} />
                                        </div>
                                        <input type="email" placeholder="Email" value={quickCustForm.email} onChange={e => setQuickCustForm({ ...quickCustForm, email: e.target.value })} required className={inputCls} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }} />
                                        <input type="password" placeholder="Password (min 6)" value={quickCustForm.password} onChange={e => setQuickCustForm({ ...quickCustForm, password: e.target.value })} required minLength={6} className={inputCls} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }} />
                                        <input type="text" placeholder="Phone (optional)" value={quickCustForm.phone} onChange={e => setQuickCustForm({ ...quickCustForm, phone: e.target.value })} className={inputCls} style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }} />
                                        <button type="button" onClick={handleQuickAddCustomer} className="btn-solid-cyan" style={{ fontSize: '0.78rem', padding: '0.45rem' }}>Create &amp; Select</button>
                                    </div>
                                ) : (
                                    <select value={formData.customerId} onChange={e => selectCustomer(e.target.value)} required className={`${inputCls} select`}>
                                        <option value="">-- Select Customer --</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Order type & table */}
                            <div style={{ display: 'grid', gridTemplateColumns: formData.orderType === 'dine-in' ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-utensils">Order Type</FieldLabel>
                                    <select value={formData.orderType} onChange={e => setFormData({ ...formData, orderType: e.target.value, tableNumber: '' })} className={inputCls}>
                                        <option value="dine-in">Dine In</option>
                                        <option value="takeaway">Takeaway</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                {formData.orderType === 'dine-in' && (
                                    <div>
                                        <FieldLabel icon="fa-chair">Table</FieldLabel>
                                        <select value={formData.tableNumber} onChange={e => setFormData({ ...formData, tableNumber: e.target.value })} className={inputCls}>
                                            <option value="">-- Select Table --</option>
                                            {tables.filter(t => t.status === 'available' || String(t.tableNumber) === String(formData.tableNumber)).map(t => (
                                                <option key={t.id} value={t.tableNumber}>Table {t.tableNumber} ({t.seatingCapacity} seats)</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <FieldLabel icon="fa-circle-dot">Status</FieldLabel>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready">Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Menu Items (new orders only) */}
                            {!editingOrder && (
                                <div>
                                    <FieldLabel icon="fa-book-open">Menu Items</FieldLabel>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,229,255,0.08)', borderRadius: 8, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 6, alignItems: 'end' }}>
                                            <select value={itemForm.menuItemId} onChange={e => selectMenuItem(e.target.value)} className={inputCls} style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}>
                                                <option value="">Pick item...</option>
                                                {menuItems.map(m => <option key={m.id} value={m.id}>{m.name} — LKR {parseFloat(m.price).toFixed(2)}</option>)}
                                            </select>
                                            <input type="number" min="1" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} className={inputCls} style={{ width: 60, fontSize: '0.75rem', padding: '0.45rem 0.5rem', textAlign: 'center' }} placeholder="Qty" />
                                            <input type="number" step="0.01" value={itemForm.unitPrice} readOnly className={inputCls} style={{ width: 80, fontSize: '0.75rem', padding: '0.45rem 0.5rem' }} placeholder="Price" />
                                            <button type="button" onClick={addItemToOrder} className="btn-solid-cyan" style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem', whiteSpace: 'nowrap' }}>
                                                <FaPlus style={{ fontSize: 10 }} /> Add
                                            </button>
                                        </div>
                                        {orderItems.length > 0 && (
                                            <div style={{ borderTop: '1px solid rgba(0,229,255,0.07)', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {orderItems.map(it => (
                                                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,229,255,0.04)', borderRadius: 6, padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                                                        <span style={{ color: '#c2d3f0' }}>{it.itemName} ×{it.quantity}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ color: '#00e5ff', fontWeight: 600 }}>LKR {(it.quantity * parseFloat(it.unitPrice)).toFixed(2)}</span>
                                                            <button type="button" onClick={() => removeItemFromOrder(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                                <FaMinus style={{ fontSize: 10 }} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#00e5ff', paddingTop: 4 }}>
                                                    <span>Total:</span><span>LKR {orderItemsTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <FieldLabel icon="fa-note-sticky">Notes</FieldLabel>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className={inputCls} rows={2} placeholder="Any special requests..." style={{ resize: 'vertical', minHeight: 60 }} />
                            </div>

                            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>
                                    {editingOrder ? 'Update' : 'Create'} Order
                                </button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>

            {/* Item Modal */}
            <AnimatePresence>
                {showItemModal && (
                    <ModalBox title={editingItem ? 'Edit Item' : 'Add Item'} icon="fa-plus" onClose={() => setShowItemModal(false)}>
                        <form onSubmit={handleItemSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!editingItem && (
                                <div>
                                    <FieldLabel icon="fa-book-open">Select Menu Item</FieldLabel>
                                    <select value={itemForm.menuItemId} onChange={e => selectMenuItem(e.target.value)} className={inputCls}>
                                        <option value="">-- Pick from menu --</option>
                                        {menuItems.map(m => <option key={m.id} value={m.id}>{m.name} — LKR {parseFloat(m.price).toFixed(2)}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <FieldLabel icon="fa-tag">Item Name</FieldLabel>
                                <input type="text" value={itemForm.itemName} onChange={e => setItemForm({ ...itemForm, itemName: e.target.value })} required className={inputCls} placeholder="Item name" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-hashtag">Quantity</FieldLabel>
                                    <input type="number" min="1" value={itemForm.quantity} onChange={e => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} required className={inputCls} />
                                </div>
                                <div>
                                    <FieldLabel icon="fa-coins">Unit Price (LKR)</FieldLabel>
                                    <input type="number" step="0.01" value={itemForm.unitPrice} onChange={e => setItemForm({ ...itemForm, unitPrice: e.target.value })} required className={inputCls} placeholder="0.00" />
                                </div>
                            </div>
                            {itemForm.unitPrice && itemForm.quantity > 0 && (
                                <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#00e5ff' }}>
                                    Total: LKR {(itemForm.quantity * parseFloat(itemForm.unitPrice || 0)).toFixed(2)}
                                </div>
                            )}
                            <div>
                                <FieldLabel icon="fa-comment">Special Request</FieldLabel>
                                <input type="text" value={itemForm.specialRequest} onChange={e => setItemForm({ ...itemForm, specialRequest: e.target.value })} className={inputCls} placeholder="Any special request..." />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowItemModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingItem ? 'Update' : 'Add'} Item</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderManagement;
