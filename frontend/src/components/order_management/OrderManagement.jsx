// order management with customer dropdown, menu item picker, table dropdown, inline items
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox, FaDollarSign, FaUserPlus, FaMinus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

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
    // items to add during order creation
    const [orderItems, setOrderItems] = useState([]);
    // quick add customer
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
            const payload = {
                customerId: formData.customerId || null,
                customerName: formData.customerName,
                orderType: formData.orderType,
                tableNumber: formData.orderType === 'dine-in' ? (formData.tableNumber || null) : null,
                status: formData.status,
                notes: formData.notes
            };
            if (editingOrder) {
                await API.put(`/orders/${editingOrder.id}`, payload);
                toast.success('Order updated');
            } else {
                const res = await API.post('/orders', payload);
                const orderId = res.data.id || res.data.order?.id;
                // add items to the created order
                if (orderId && orderItems.length > 0) {
                    for (const item of orderItems) {
                        await API.post('/orders/items', {
                            orderId,
                            itemName: item.itemName,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                            specialInstructions: item.specialRequest || ''
                        });
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
            if (editingItem) {
                await API.put(`/orders/items/${editingItem.id}`, payload);
                toast.success('Item updated');
            } else {
                await API.post('/orders/items', { ...payload, orderId: selectedOrder.id });
                toast.success('Item added');
            }
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
            if (newCust) {
                setFormData(f => ({ ...f, customerId: newCust.id, customerName: `${newCust.firstName} ${newCust.lastName}` }));
            }
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

    // add menu item to the new order's item list
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

    const getStatusColor = (status) => {
        const m = { pending: 'bg-warning/15 text-warning', preparing: 'bg-info/15 text-info', ready: 'bg-success/15 text-success', completed: 'bg-success/15 text-success', cancelled: 'bg-danger/15 text-danger' };
        return m[status] || 'bg-gray-100 text-gray-600';
    };

    const orderItemsTotal = orderItems.reduce((s, i) => s + i.quantity * parseFloat(i.unitPrice || 0), 0);

    return (
        <>
            {/* header row */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2"><FaShoppingCart className="text-amber-600" /> Order Management</h1>
                    <p className="text-amber-900-light/50 text-xs mt-0.5">Manage all cafe orders and statuses.</p>
                </div>
                <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer">
                    <FaPlus size={15} /> New Order
                </button>
            </motion.div>

            {/* card container for search + orders */}
            <div className="bg-white rounded-xl shadow-sm border border-warm/40 p-5 md:p-6 mb-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full max-w-[400px]">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-sm" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all pl-9" />
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-secondary border-t-transparent" /></div>
                ) : filteredOrders.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center min-h-[300px] py-10">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-400"><FaBox className="text-3xl" /></div>
                        <h3 className="text-base font-bold text-amber-900 mb-1">No Orders Found</h3>
                        <p className="text-sm text-amber-900-light/50 mb-4">Start by creating your first order</p>
                        <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                            <FaPlus size={15} /> New Order
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredOrders.map((order, i) => (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all">
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <h3 className="font-bold text-amber-900 text-sm">{order.orderNumber}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                                    </div>
                                    <div className="space-y-1 text-xs text-amber-900-light/60">
                                        <p><span className="font-medium text-amber-900">Customer:</span> {order.customerName}</p>
                                        <p><span className="font-medium text-amber-900">Type:</span> {order.orderType}</p>
                                        {order.tableNumber && <p><span className="font-medium text-amber-900">Table:</span> #{order.tableNumber}</p>}
                                        <p className="text-base font-bold text-amber-900 pt-1">LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="mt-2.5 pt-2.5 border-t border-warm/40">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[10px] font-semibold text-amber-900-light/70">Items ({order.items.length})</p>
                                                <button onClick={() => openAddItem(order)} className="text-amber-600 hover:text-accent cursor-pointer"><FaPlus size={13} /></button>
                                            </div>
                                            <div className="space-y-1">
                                                {order.items.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between bg-[#FFF8F0] rounded-md px-2 py-1 text-[10px]">
                                                        <span className="text-amber-900 font-medium">{item.itemName} x{item.quantity}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-amber-900-light/50">LKR {parseFloat(item.totalPrice).toFixed(2)}</span>
                                                            <button onClick={() => openEditItem(item)} className="text-info hover:text-blue-700 cursor-pointer"><FaEdit size={10} /></button>
                                                            <button onClick={() => handleDeleteItem(item.id)} className="text-danger hover:text-red-700 cursor-pointer"><FaTrash size={10} /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && <p className="text-[10px] text-amber-900-light/40 text-center">+{order.items.length - 3} more</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => openEdit(order)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                    <button onClick={() => openAddItem(order)} className="text-success hover:bg-success/10"><FaPlus size={13} /> Add Item</button>
                                    {(order.status === 'completed' || order.status === 'ready') && (
                                        <button onClick={() => navigate('/payments')} className="text-green-600 hover:bg-green-50"><FaDollarSign size={13} /> Pay</button>
                                    )}
                                    <button onClick={() => handleDelete(order.id)} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* order modal — with customer dropdown, menu items, table dropdown */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingOrder ? 'Edit Order' : 'New Order'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* customer selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-medium text-amber-900">Customer</label>
                                        <button type="button" onClick={() => setShowQuickCustomer(!showQuickCustomer)} className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-0.5 cursor-pointer">
                                            <FaUserPlus size={10} /> {showQuickCustomer ? 'Cancel' : 'New Customer'}
                                        </button>
                                    </div>
                                    {showQuickCustomer ? (
                                        <div className="bg-amber-50/50 rounded-lg p-3 space-y-2 border border-amber-100">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="First name" value={quickCustForm.firstName} onChange={e => setQuickCustForm({ ...quickCustForm, firstName: e.target.value })} required className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                                <input type="text" placeholder="Last name" value={quickCustForm.lastName} onChange={e => setQuickCustForm({ ...quickCustForm, lastName: e.target.value })} required className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                            </div>
                                            <input type="email" placeholder="Email" value={quickCustForm.email} onChange={e => setQuickCustForm({ ...quickCustForm, email: e.target.value })} required className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                            <input type="password" placeholder="Password (min 6)" value={quickCustForm.password} onChange={e => setQuickCustForm({ ...quickCustForm, password: e.target.value })} required minLength={6} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                            <input type="text" placeholder="Phone (optional)" value={quickCustForm.phone} onChange={e => setQuickCustForm({ ...quickCustForm, phone: e.target.value })} className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" />
                                            <button type="button" onClick={handleQuickAddCustomer} className="w-full bg-amber-600 text-white text-xs py-1.5 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer">Create & Select</button>
                                        </div>
                                    ) : (
                                        <select value={formData.customerId} onChange={(e) => selectCustomer(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                            <option value="">-- Select Customer --</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* order type + table */}
                                <div className={`grid ${formData.orderType === 'dine-in' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Order Type</label>
                                        <select value={formData.orderType} onChange={(e) => setFormData({ ...formData, orderType: e.target.value, tableNumber: '' })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                            <option value="dine-in">Dine In</option>
                                            <option value="takeaway">Takeaway</option>
                                            <option value="online">Online</option>
                                        </select>
                                    </div>
                                    {formData.orderType === 'dine-in' && (
                                        <div>
                                            <label className="block text-xs font-medium text-amber-900 mb-1">Table</label>
                                            <select value={formData.tableNumber} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                                <option value="">-- Select Table --</option>
                                                {tables.filter(t => t.status === 'available' || String(t.tableNumber) === String(formData.tableNumber)).map(t => (
                                                    <option key={t.id} value={t.tableNumber}>Table {t.tableNumber} ({t.seatingCapacity} seats, {t.location})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* status */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                        <option value="pending">Pending</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                {/* menu items — only for new orders */}
                                {!editingOrder && (
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Menu Items</label>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
                                            <div className="grid grid-cols-12 gap-2 items-end">
                                                <div className="col-span-5">
                                                    <select value={itemForm.menuItemId} onChange={(e) => selectMenuItem(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500">
                                                        <option value="">Pick menu item</option>
                                                        {menuItems.map(m => (
                                                            <option key={m.id} value={m.id}>{m.name} — LKR {parseFloat(m.price).toFixed(2)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2">
                                                    <input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Qty" />
                                                </div>
                                                <div className="col-span-3">
                                                    <input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Price" readOnly />
                                                </div>
                                                <div className="col-span-2">
                                                    <button type="button" onClick={addItemToOrder} className="w-full bg-amber-600 text-white py-2 rounded-lg text-xs hover:bg-amber-700 transition-colors cursor-pointer flex items-center justify-center gap-1">
                                                        <FaPlus size={10} /> Add
                                                    </button>
                                                </div>
                                            </div>

                                            {orderItems.length > 0 && (
                                                <div className="space-y-1.5 pt-2 border-t border-gray-200">
                                                    {orderItems.map((it) => (
                                                        <div key={it.id} className="flex items-center justify-between bg-white rounded-md px-3 py-1.5 text-xs border border-gray-100">
                                                            <span className="text-amber-900 font-medium">{it.itemName} × {it.quantity}</span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-amber-900 font-bold">LKR {(it.quantity * parseFloat(it.unitPrice)).toFixed(2)}</span>
                                                                <button type="button" onClick={() => removeItemFromOrder(it.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><FaMinus size={10} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-between text-xs font-bold text-amber-900 pt-1">
                                                        <span>Total:</span>
                                                        <span>LKR {orderItemsTotal.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* notes */}
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Notes</label>
                                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" rows={2} placeholder="Any special requests..." />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex-1 cursor-pointer">Cancel</button>
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex-1 cursor-pointer">{editingOrder ? 'Update' : 'Create'} Order</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* item modal — for adding items to existing orders */}
            <AnimatePresence>
                {showItemModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                                <button onClick={() => setShowItemModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleItemSubmit} className="p-5 space-y-4">
                                {!editingItem && (
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Select Menu Item</label>
                                        <select value={itemForm.menuItemId} onChange={(e) => selectMenuItem(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                            <option value="">-- Pick from menu --</option>
                                            {menuItems.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} — LKR {parseFloat(m.price).toFixed(2)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Item Name</label>
                                    <input type="text" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Item name" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Quantity</label>
                                        <input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Unit Price (LKR)</label>
                                        <input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" />
                                    </div>
                                </div>
                                {itemForm.unitPrice && itemForm.quantity > 0 && (
                                    <div className="text-right text-xs text-amber-900 font-bold">
                                        Total: LKR {(itemForm.quantity * parseFloat(itemForm.unitPrice || 0)).toFixed(2)}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Special Request</label>
                                    <input type="text" value={itemForm.specialRequest} onChange={(e) => setItemForm({ ...itemForm, specialRequest: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Any special request..." />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowItemModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex-1 cursor-pointer">Cancel</button>
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex-1 cursor-pointer">{editingItem ? 'Update' : 'Add'} Item</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default OrderManagement;
