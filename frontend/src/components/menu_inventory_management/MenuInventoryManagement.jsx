// futuristic dark menu & inventory management — preserves all logic
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
            style={{ background: '#0d1526', border: '1px solid rgba(0,229,255,0.18)', borderRadius: '1.25rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(0,229,255,0.1)' }}>
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

const MenuInventoryManagement = () => {
    const [activeTab, setActiveTab] = useState('menu');
    const [menuItems, setMenuItems] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [menuForm, setMenuForm] = useState({ name: '', description: '', category: 'beverage', price: '', isAvailable: true });
    const [imageFile, setImageFile] = useState(null);
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
            const fd = new FormData();
            Object.entries(menuForm).forEach(([k, v]) => fd.append(k, v));
            if (imageFile) fd.append('image', imageFile);
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (editingItem) { await API.put(`/menu/items/${editingItem.id}`, fd, config); toast.success('Item updated'); }
            else { await API.post('/menu/items', fd, config); toast.success('Item added'); }
            fetchData(); setShowModal(false); setImageFile(null);
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
        try { await API.delete(`/menu/${type === 'menu' ? 'items' : 'stock'}/${id}`); toast.success('Deleted'); fetchData(); }
        catch { toast.error('Failed to delete'); }
    };

    const openEditMenu = (item) => { setEditingItem(item); setMenuForm({ name: item.name, description: item.description || '', category: item.category, price: item.price, isAvailable: item.isAvailable }); setImageFile(null); setShowModal(true); };
    const openEditStock = (item) => { setEditingStock(item); setStockForm({ ingredientName: item.ingredientName, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, supplier: item.supplier || '', expiryDate: item.expiryDate?.split('T')[0] || '' }); setShowStockModal(true); };

    const categories = ['all', 'beverage', 'appetizer', 'main_course', 'dessert', 'snack', 'special'];
    const filteredMenu = menuItems.filter(i => (categoryFilter === 'all' || i.category === categoryFilter) && (i.name?.toLowerCase().includes(search.toLowerCase())));
    const filteredStock = stockItems.filter(i => i.ingredientName?.toLowerCase().includes(search.toLowerCase()));
    const lowStockCount = stockItems.filter(s => s.quantity < (s.minimumStock || 10)).length;

    const catColor = { beverage: '#00e5ff', appetizer: '#f59e0b', main_course: '#10b981', dessert: '#a855f7', snack: '#f97316', special: '#ec4899' };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
                <div>
                    <h1 className="page-title"><i className="fa-solid fa-book-open" style={{ color: '#f59e0b', marginRight: 10 }}></i>Menu &amp; Inventory</h1>
                    <p className="page-subtitle">Manage menu items and inventory stock</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                        if (activeTab === 'menu') { setEditingItem(null); setMenuForm({ name: '', description: '', category: 'beverage', price: '', isAvailable: true }); setShowModal(true); }
                        else { setEditingStock(null); setStockForm({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '', supplier: '', expiryDate: '' }); setShowStockModal(true); }
                    }} className="btn-solid-cyan">
                        <FaPlus style={{ fontSize: 12 }} /> Add {activeTab === 'menu' ? 'Item' : 'Stock'}
                    </button>
                </div>
            </motion.div>

            {/* Tabs + Search */}
            <div className="section-card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3, border: '1px solid rgba(0,229,255,0.1)' }}>
                        {['menu', 'stock'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.4rem 1rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                    background: activeTab === tab ? 'rgba(0,229,255,0.12)' : 'transparent',
                                    border: activeTab === tab ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent',
                                    color: activeTab === tab ? '#00e5ff' : '#6b84b0',
                                    transition: 'all 0.2s',
                                }}>
                                <i className={`fa-solid ${tab === 'menu' ? 'fa-book-open' : 'fa-box'} mr-1.5`} style={{ fontSize: 11 }}></i>
                                {tab === 'menu' ? 'Menu Items' : 'Inventory'}
                            </button>
                        ))}
                    </div>

                    {/* Category filter */}
                    {activeTab === 'menu' && (
                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                            className="input-dark" style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}>
                            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    )}

                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 12, pointerEvents: 'none' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="input-dark" style={{ paddingLeft: '2.5rem', padding: '0.45rem 0.875rem 0.45rem 2.5rem' }} />
                    </div>
                </div>
            </div>

            {/* Low stock alert */}
            {activeTab === 'stock' && lowStockCount > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#f59e0b' }}>
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    {lowStockCount} item{lowStockCount > 1 ? 's' : ''} running low on stock
                </motion.div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : activeTab === 'menu' ? (
                filteredMenu.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-book-open" style={{ color: '#f59e0b', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Menu Items Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Start by adding your first menu item</p>
                        <button onClick={() => { setEditingItem(null); setMenuForm({ name: '', description: '', category: 'beverage', price: '', isAvailable: true }); setShowModal(true); }} className="btn-neon-amber">
                            <FaPlus style={{ fontSize: 11 }} /> Add Menu Item
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                        {filteredMenu.map((item, i) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                                style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.28)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.12)'}>
                                {item.image ? (
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(245,158,11,0.08)' }}>
                                        <i className="fa-solid fa-mug-hot" style={{ fontSize: 28, color: 'rgba(245,158,11,0.3)' }}></i>
                                    </div>
                                )}
                                <div style={{ padding: '0.875rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2eaf7' }}>{item.name}</h3>
                                        <span className={`badge ${item.isAvailable ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem' }}>{item.isAvailable ? 'Available' : 'Unavail.'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.72rem', color: '#3d5278', marginBottom: 8, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description || 'No description'}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: `${catColor[item.category] || '#6b84b0'}15`, color: catColor[item.category] || '#6b84b0', border: `1px solid ${catColor[item.category] || '#6b84b0'}25`, fontWeight: 600, textTransform: 'capitalize' }}>
                                            {item.category?.replace('_', ' ')}
                                        </span>
                                        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>LKR {parseFloat(item.price).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => openEditMenu(item)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit</button>
                                    <button onClick={() => handleDelete(item.id, 'menu')} className="btn-danger" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : ( // Stock
                filteredStock.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-box" style={{ color: '#6b84b0', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Stock Items</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Add ingredients and supplies to track</p>
                        <button onClick={() => { setEditingStock(null); setStockForm({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '', supplier: '', expiryDate: '' }); setShowStockModal(true); }} className="btn-solid-cyan">
                            <FaPlus style={{ fontSize: 11 }} /> Add Stock
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                        {filteredStock.map((item, i) => {
                            const isLow = item.quantity < (item.minimumStock || 10);
                            return (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                                    style={{ background: 'rgba(13,21,38,0.7)', border: `1px solid ${isLow ? 'rgba(245,158,11,0.25)' : 'rgba(0,229,255,0.1)'}`, borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s' }}>
                                    <div style={{ padding: '1rem 1.125rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2eaf7' }}>{item.ingredientName}</h3>
                                            {isLow && <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}><i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 9 }}></i> Low</span>}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.78rem' }}>
                                            <div style={{ background: 'rgba(0,229,255,0.05)', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
                                                <p style={{ color: '#3d5278', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quantity</p>
                                                <p style={{ color: '#00e5ff', fontWeight: 700, marginTop: 2 }}>{item.quantity} {item.unit}</p>
                                            </div>
                                            <div style={{ background: 'rgba(245,158,11,0.05)', borderRadius: 6, padding: '0.4rem 0.6rem' }}>
                                                <p style={{ color: '#3d5278', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Unit Price</p>
                                                <p style={{ color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>LKR {parseFloat(item.unitPrice).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        {item.supplier && <p style={{ fontSize: '0.72rem', color: '#6b84b0', marginTop: 8 }}><i className="fa-solid fa-truck" style={{ marginRight: 5, fontSize: 10, color: '#3d5278' }}></i>{item.supplier}</p>}
                                        {item.expiryDate && <p style={{ fontSize: '0.72rem', color: '#6b84b0', marginTop: 4 }}><i className="fa-solid fa-calendar-xmark" style={{ marginRight: 5, fontSize: 10, color: '#3d5278' }}></i>Exp: {new Date(item.expiryDate).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => openEditStock(item)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit</button>
                                        <button onClick={() => handleDelete(item.id, 'stock')} className="btn-danger" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete</button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            )}

            {/* Menu Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalBox title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'} icon="fa-book-open" onClose={() => setShowModal(false)}>
                        <form onSubmit={handleMenuSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><FieldLabel icon="fa-tag">Item Name</FieldLabel><input type="text" value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} required className="input-dark" placeholder="Item name" /></div>
                            <div><FieldLabel icon="fa-align-left">Description</FieldLabel><textarea value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} className="input-dark" rows={2} placeholder="Description..." style={{ resize: 'vertical' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-layer-group">Category</FieldLabel>
                                    <select value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })} className="input-dark">
                                        <option value="beverage">Beverage</option><option value="appetizer">Appetizer</option><option value="main_course">Main Course</option><option value="dessert">Dessert</option><option value="snack">Snack</option><option value="special">Special</option>
                                    </select>
                                </div>
                                <div><FieldLabel icon="fa-coins">Price (LKR)</FieldLabel><input type="number" step="0.01" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} required className="input-dark" placeholder="0.00" /></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" checked={menuForm.isAvailable} onChange={e => setMenuForm({ ...menuForm, isAvailable: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#00e5ff' }} />
                                <span style={{ fontSize: '0.82rem', color: '#c2d3f0' }}>Available for ordering</span>
                            </div>
                            <div>
                                <FieldLabel icon="fa-image">Item Image</FieldLabel>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input-dark" style={{ cursor: 'pointer' }} />
                                {editingItem?.image && !imageFile && <p style={{ fontSize: '0.7rem', color: '#3d5278', marginTop: 4 }}>Current image will be kept if no new file selected</p>}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingItem ? 'Update' : 'Add'} Item</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>

            {/* Stock Modal */}
            <AnimatePresence>
                {showStockModal && (
                    <ModalBox title={editingStock ? 'Edit Stock Item' : 'Add Stock Item'} icon="fa-box" onClose={() => setShowStockModal(false)}>
                        <form onSubmit={handleStockSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><FieldLabel icon="fa-tag">Ingredient Name</FieldLabel><input type="text" value={stockForm.ingredientName} onChange={e => setStockForm({ ...stockForm, ingredientName: e.target.value })} required className="input-dark" placeholder="Ingredient name" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-hashtag">Quantity</FieldLabel><input type="number" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required className="input-dark" /></div>
                                <div>
                                    <FieldLabel icon="fa-ruler">Unit</FieldLabel>
                                    <select value={stockForm.unit} onChange={e => setStockForm({ ...stockForm, unit: e.target.value })} className="input-dark">
                                        <option value="kg">Kg</option><option value="g">Grams</option><option value="l">Liters</option><option value="ml">mL</option><option value="pieces">Pieces</option><option value="packets">Packets</option>
                                    </select>
                                </div>
                                <div><FieldLabel icon="fa-coins">Price (LKR)</FieldLabel><input type="number" step="0.01" value={stockForm.unitPrice} onChange={e => setStockForm({ ...stockForm, unitPrice: e.target.value })} required className="input-dark" placeholder="0.00" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-truck">Supplier</FieldLabel><input type="text" value={stockForm.supplier} onChange={e => setStockForm({ ...stockForm, supplier: e.target.value })} className="input-dark" placeholder="Supplier name" /></div>
                                <div><FieldLabel icon="fa-calendar-xmark">Expiry Date</FieldLabel><input type="date" value={stockForm.expiryDate} onChange={e => setStockForm({ ...stockForm, expiryDate: e.target.value })} className="input-dark" /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowStockModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingStock ? 'Update' : 'Add'} Stock</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MenuInventoryManagement;
