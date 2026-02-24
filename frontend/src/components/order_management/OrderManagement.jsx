// order management with improved layout, contained search, better empty state
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox } from 'react-icons/fa';

import API from '../../services/api';
import toast from 'react-hot-toast';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [formData, setFormData] = useState({ customerName: '', orderType: 'dine-in', tableNumber: '', status: 'pending', specialInstructions: '' });
    const [itemForm, setItemForm] = useState({ itemName: '', quantity: 1, unitPrice: '', specialRequest: '' });

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders');
            setOrders(res.data);
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingOrder) {
                await API.put(`/orders/${editingOrder.id}`, formData);
                toast.success('Order updated');
            } else {
                await API.post('/orders', formData);
                toast.success('Order created');
            }
            fetchOrders(); setShowModal(false); resetForm();
        } catch { toast.error('Failed to save order'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this order?')) return;
        try { await API.delete(`/orders/${id}`); toast.success('Order deleted'); fetchOrders(); }
        catch { toast.error('Failed to delete'); }
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await API.put(`/orders/items/${editingItem.id}`, { ...itemForm, totalPrice: itemForm.quantity * itemForm.unitPrice });
                toast.success('Item updated');
            } else {
                await API.post(`/orders/${selectedOrder.id}/items`, { ...itemForm, totalPrice: itemForm.quantity * itemForm.unitPrice });
                toast.success('Item added');
            }
            fetchOrders(); setShowItemModal(false); setItemForm({ itemName: '', quantity: 1, unitPrice: '', specialRequest: '' });
        } catch { toast.error('Failed to save item'); }
    };

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Delete this item?')) return;
        try { await API.delete(`/orders/items/${itemId}`); toast.success('Item deleted'); fetchOrders(); }
        catch { toast.error('Failed to delete item'); }
    };

    const resetForm = () => { setFormData({ customerName: '', orderType: 'dine-in', tableNumber: '', status: 'pending', specialInstructions: '' }); };
    const openEdit = (order) => { setEditingOrder(order); setFormData({ customerName: order.customerName, orderType: order.orderType, tableNumber: order.tableNumber || '', status: order.status, specialInstructions: order.specialInstructions || '' }); setShowModal(true); };
    const openAddItem = (order) => { setSelectedOrder(order); setEditingItem(null); setItemForm({ itemName: '', quantity: 1, unitPrice: '', specialRequest: '' }); setShowItemModal(true); };
    const openEditItem = (item) => { setEditingItem(item); setItemForm({ itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice, specialRequest: item.specialRequest || '' }); setShowItemModal(true); };

    const filteredOrders = orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || o.customerName?.toLowerCase().includes(search.toLowerCase()));

    const getStatusColor = (status) => {
        const m = { pending: 'bg-warning/15 text-warning', preparing: 'bg-info/15 text-info', ready: 'bg-success/15 text-success', completed: 'bg-success/15 text-success', cancelled: 'bg-danger/15 text-danger' };
        return m[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* header row */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2"><FaShoppingCart className="text-amber-600" /> Order Management</h1>
                        <p className="text-amber-900-light/50 text-xs mt-0.5">Manage all cafe orders and statuses.</p>
                    </div>
                    <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="flex items-center gap-1.5 bg-amber-600 text-amber-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm cursor-pointer">
                        <FaPlus size={15} /> New Order
                    </button>
                </motion.div>

                {/* card container for search + orders */}
                <div className="bg-white rounded-xl shadow-sm border border-warm/40 p-5 md:p-6 mb-8">
                    {/* search bar — contained */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="relative w-full max-w-[400px]">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-sm" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all pl-9" />
                        </div>
                    </motion.div>

                    {/* orders content */}
                    {loading ? (
                        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-secondary border-t-transparent" /></div>
                    ) : filteredOrders.length === 0 ? (
                        /* attractive empty state */
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8 border-none shadow-none min-h-[300px] py-10">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-400">
                                <FaBox className="text-3xl" />
                            </div>
                            <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title">No Orders Found</h3>
                            <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc">Start by creating your first order</p>
                            <button onClick={() => { setEditingOrder(null); resetForm(); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200 mt-2">
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

                                        {/* items preview */}
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
                                        <button onClick={() => handleDelete(order.id)} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* order modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingOrder ? 'Edit Order' : 'New Order'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Customer Name</label>
                                    <input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Enter customer name" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Order Type</label>
                                        <select value={formData.orderType} onChange={(e) => setFormData({ ...formData, orderType: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all">
                                            <option value="dine-in">Dine In</option>
                                            <option value="takeaway">Takeaway</option>
                                            <option value="delivery">Delivery</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Table #</label>
                                        <input type="number" value={formData.tableNumber} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Table" />
                                    </div>
                                </div>
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
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Special Instructions</label>
                                    <textarea value={formData.specialInstructions} onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" rows={2} placeholder="Any special requests..." />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button>
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingOrder ? 'Update' : 'Create'} Order</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* item modal */}
            <AnimatePresence>
                {showItemModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
                                <button onClick={() => setShowItemModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleItemSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Item Name</label>
                                    <input type="text" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Item name" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Quantity</label>
                                        <input type="number" min="1" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-amber-900 mb-1">Unit Price (LKR)</label>
                                        <input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-amber-900 mb-1">Special Request</label>
                                    <input type="text" value={itemForm.specialRequest} onChange={(e) => setItemForm({ ...itemForm, specialRequest: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Any special request..." />
                                </div>
                                <div className="flex gap-2.5 pt-2">
                                    <button type="button" onClick={() => setShowItemModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button>
                                    <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingItem ? 'Update' : 'Add'} Item</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default OrderManagement;
