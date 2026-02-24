// menu & inventory management with flex header, improved tabs, grid cards, CTA empty states
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

import API from '../../services/api';
import toast from 'react-hot-toast';

const MenuInventoryManagement = () => {
    const [activeTab, setActiveTab] = useState('menu');
    const [menuItems, setMenuItems] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [menuForm, setMenuForm] = useState({ name: '', description: '', category: 'beverages', price: '', isAvailable: true });
    const [stockForm, setStockForm] = useState({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '', supplier: '', expiryDate: '' });
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingStock, setEditingStock] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [menuRes, stockRes] = await Promise.all([
                API.get('/menu/items').catch(() => ({ data: [] })),
                API.get('/menu/stock').catch(() => ({ data: [] }))
            ]);
            setMenuItems(menuRes.data); setStockItems(stockRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) { await API.put(`/menu/items/${editingItem.id}`, menuForm); toast.success('Item updated'); }
            else { await API.post('/menu/items', menuForm); toast.success('Item added'); }
            fetchData(); setShowModal(false);
        } catch { toast.error('Failed to save'); }
    };

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStock) { await API.put(`/menu/stock/${editingStock.id}`, stockForm); toast.success('Stock updated'); }
            else { await API.post('/menu/stock', stockForm); toast.success('Stock added'); }
            fetchData(); setShowStockModal(false);
        } catch { toast.error('Failed to save'); }
    };

    const handleDelete = async (id, type) => {
        if (!confirm(`Delete this ${type}?`)) return;
        try {
            await API.delete(`/menu/${type === 'menu' ? 'items' : 'stock'}/${id}`);
            toast.success('Deleted'); fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const openEditMenu = (item) => { setEditingItem(item); setMenuForm({ name: item.name, description: item.description || '', category: item.category, price: item.price, isAvailable: item.isAvailable }); setShowModal(true); };
    const openEditStock = (item) => { setEditingStock(item); setStockForm({ ingredientName: item.ingredientName, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, supplier: item.supplier || '', expiryDate: item.expiryDate?.split('T')[0] || '' }); setShowStockModal(true); };

    const categories = ['all', 'beverages', 'appetizers', 'main-course', 'desserts', 'snacks'];
    const filteredMenu = menuItems.filter(i => (categoryFilter === 'all' || i.category === categoryFilter) && (i.name?.toLowerCase().includes(search.toLowerCase())));
    const filteredStock = stockItems.filter(i => i.ingredientName?.toLowerCase().includes(search.toLowerCase()));
    const lowStockCount = stockItems.filter(s => s.quantity < 10).length;

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* header */}
                {/* header */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-4 md:p-5 rounded-xl border border-warm/40 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2"><FaBookOpen className="text-amber-600" /> Menu & Inventory</h1>
                        <p className="text-amber-900-light/50 text-xs mt-0.5">Manage menu items and inventory stock.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                        {/* tabs */}
                        <div className="flex bg-orange-50/20 rounded-lg p-1 shrink-0">
                            {['menu', 'stock'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none ${activeTab === tab ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-900-light/50 hover:text-amber-900'}`}>
                                    {tab === 'menu' ? 'Menu' : 'Stock'}
                                </button>
                            ))}
                        </div>

                        {/* search & filter */}
                        <div className="flex items-center gap-2 flex-1 w-full">
                            {activeTab === 'menu' && (
                                <div className="relative shrink-0">
                                    <FaFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-xs" />
                                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="pl-7 pr-3 py-2.5 bg-white border border-warm/50 rounded-lg text-xs focus:outline-none focus:border-secondary transition-colors appearance-none cursor-pointer">
                                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="relative flex-1 min-w-[150px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-sm" />
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2.5 bg-white border border-warm/50 rounded-lg text-sm focus:outline-none focus:border-secondary transition-colors" />
                            </div>
                        </div>

                        {/* action button */}
                        <button onClick={() => { activeTab === 'menu' ? (setEditingItem(null), setMenuForm({ name: '', description: '', category: 'beverages', price: '', isAvailable: true }), setShowModal(true)) : (setEditingStock(null), setStockForm({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '', supplier: '', expiryDate: '' }), setShowStockModal(true)); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 shrink-0">
                            <FaPlus size={15} /> Add {activeTab === 'menu' ? 'Item' : 'Stock'}
                        </button>
                    </div>
                </motion.div>

                {/* stock alert */}
                {activeTab === 'stock' && lowStockCount > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-warning/10 border border-warning/30 rounded-lg px-4 py-2.5 mb-5 text-xs text-warning font-medium">
                        <FaExclamationTriangle size={14} /> {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
                    </motion.div>
                )}

                {/* content */}
                {loading ? (
                    <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-secondary border-t-transparent" /></div>
                ) : activeTab === 'menu' ? (
                    filteredMenu.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5 text-orange-400"><FaBookOpen className="text-3xl" /></div>
                            <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title">No Menu Items Found</h3>
                            <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc">Start by adding your first menu item</p>
                            <button onClick={() => { setEditingItem(null); setMenuForm({ name: '', description: '', category: 'beverages', price: '', isAvailable: true }); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200 mt-2"><FaPlus size={14} /> Add Menu Item</button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredMenu.map((item, i) => (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all flex flex-col">
                                    <div className="h-32 bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center">
                                        <FaBookOpen className="text-amber-600/40 text-3xl" />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-1.5">
                                            <h3 className="text-sm font-bold text-amber-900">{item.name}</h3>
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${item.isAvailable ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                                        </div>
                                        <p className="text-[10px] text-amber-900-light/50 mb-2 flex-1 line-clamp-2">{item.description || 'No description'}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] bg-orange-50/40 text-amber-900-light/70 px-2 py-0.5 rounded capitalize">{item.category}</span>
                                            <span className="text-sm font-bold text-amber-900">LKR {parseFloat(item.price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => openEditMenu(item)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                        <button onClick={() => handleDelete(item.id, 'menu')} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    filteredStock.length === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-500"><FaBox className="text-3xl" /></div>
                            <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title">No Stock Items Found</h3>
                            <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc">Add ingredients and supplies to track</p>
                            <button onClick={() => { setEditingStock(null); setStockForm({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '', supplier: '', expiryDate: '' }); setShowStockModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200 mt-2"><FaPlus size={14} /> Add Stock</button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredStock.map((item, i) => (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all">
                                    <div className="p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-sm font-bold text-amber-900">{item.ingredientName}</h3>
                                            {item.quantity < 10 && <span className="text-[10px] bg-danger/15 text-danger px-1.5 py-0.5 rounded">Low</span>}
                                        </div>
                                        <div className="flex gap-3 text-xs text-amber-900-light/60">
                                            <p>Qty: <span className="font-medium text-amber-900">{item.quantity} {item.unit}</span></p>
                                            <p>Price: <span className="font-medium text-amber-900">LKR {parseFloat(item.unitPrice).toFixed(2)}</span></p>
                                        </div>
                                        {item.supplier && <p className="text-[10px] text-amber-900-light/50">Supplier: {item.supplier}</p>}
                                        {item.expiryDate && <p className="text-[10px] text-amber-900-light/50">Expires: {new Date(item.expiryDate).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => openEditStock(item)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                        <button onClick={() => handleDelete(item.id, 'stock')} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* menu modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleMenuSubmit} className="p-5 space-y-4">
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Item Name</label><input type="text" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Item name" /></div>
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Description</label><textarea value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" rows={2} placeholder="Description..." /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Category</label><select value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="beverages">Beverages</option><option value="appetizers">Appetizers</option><option value="main-course">Main Course</option><option value="desserts">Desserts</option><option value="snacks">Snacks</option></select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Price (LKR)</label><input type="number" step="0.01" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                </div>
                                <div className="flex items-center gap-2"><input type="checkbox" checked={menuForm.isAvailable} onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })} className="rounded border-warm" /><span className="text-xs text-amber-900">Available</span></div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingItem ? 'Update' : 'Add'} Item</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* stock modal */}
            <AnimatePresence>
                {showStockModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingStock ? 'Edit Stock Item' : 'Add Stock Item'}</h2>
                                <button onClick={() => setShowStockModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleStockSubmit} className="p-5 space-y-4">
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Ingredient Name</label><input type="text" value={stockForm.ingredientName} onChange={(e) => setStockForm({ ...stockForm, ingredientName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Ingredient" /></div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Quantity</label><input type="number" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Unit</label><select value={stockForm.unit} onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="kg">Kg</option><option value="g">Grams</option><option value="l">Liters</option><option value="ml">mL</option><option value="pcs">Pieces</option></select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Price</label><input type="number" step="0.01" value={stockForm.unitPrice} onChange={(e) => setStockForm({ ...stockForm, unitPrice: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Supplier</label><input type="text" value={stockForm.supplier} onChange={(e) => setStockForm({ ...stockForm, supplier: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Supplier" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Expiry Date</label><input type="date" value={stockForm.expiryDate} onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" /></div>
                                </div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowStockModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingStock ? 'Update' : 'Add'} Stock</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    );
};

export default MenuInventoryManagement;
