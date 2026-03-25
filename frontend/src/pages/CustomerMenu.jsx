// futuristic dark customer menu page — with Add-to-Cart + Place Order flow
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categoryIcons = {
    all: 'fa-border-all', beverage: 'fa-mug-hot', appetizer: 'fa-bowl-food',
    main_course: 'fa-utensils', dessert: 'fa-cake-candles', snack: 'fa-cookie-bite', special: 'fa-star',
};
const categoryColors = {
    all: '#00e5ff', beverage: '#00e5ff', appetizer: '#f59e0b', main_course: '#10b981',
    dessert: '#a855f7', snack: '#ef4444', special: '#f59e0b',
};

const CustomerMenu = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    // Cart state
    const [cart, setCart] = useState([]);         // [{ item, quantity }]
    const [cartOpen, setCartOpen] = useState(false);
    const [orderType, setOrderType] = useState('dine-in');
    const [tableNumber, setTableNumber] = useState('');
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        API.get('/menu/items').then(r => setMenuItems(r.data)).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const categories = ['all', 'beverage', 'appetizer', 'main_course', 'dessert', 'snack', 'special'];
    const filtered = menuItems.filter(i =>
        (category === 'all' || i.category === category) &&
        i.name?.toLowerCase().includes(search.toLowerCase())
    );

    // ── Cart helpers ──────────────────────────────────────────────────
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.item.id === item.id);
            if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
            return [...prev, { item, quantity: 1 }];
        });
        toast.success(`${item.name} added to cart`, { icon: '🛒', duration: 1500 });
        setCartOpen(true);
    };

    const removeFromCart = (itemId) => setCart(prev => prev.filter(c => c.item.id !== itemId));

    const changeQty = (itemId, delta) => setCart(prev =>
        prev.map(c => c.item.id === itemId
            ? { ...c, quantity: Math.max(1, c.quantity + delta) }
            : c
        )
    );

    const cartTotal = cart.reduce((s, c) => s + parseFloat(c.item.price) * c.quantity, 0);
    const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

    // ── Place Order ───────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to place an order');
            navigate('/login');
            return;
        }
        if (cart.length === 0) { toast.error('Cart is empty'); return; }
        if (orderType === 'dine-in' && !tableNumber) { toast.error('Please enter your table number'); return; }

        setPlacingOrder(true);
        try {
            const payload = {
                customerName: `${user.firstName} ${user.lastName}`,
                orderType,
                tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : null,
                notes: '',
                items: cart.map(c => ({
                    menuItemId: c.item.id,
                    itemName: c.item.name,
                    quantity: c.quantity,
                    unitPrice: parseFloat(c.item.price),
                })),
            };
            await API.post('/orders', payload);
            toast.success('🎉 Order placed successfully!');
            setCart([]);
            setCartOpen(false);
            setTableNumber('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    const getCartQty = (itemId) => cart.find(c => c.item.id === itemId)?.quantity || 0;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070b14', fontFamily: "'Inter', sans-serif" }}>
            <Navbar />

            {/* Hero */}
            <section style={{ position: 'relative', padding: '4rem 1.25rem 2.5rem', overflow: 'hidden', borderBottom: '1px solid rgba(0,229,255,0.07)', minHeight: 220, display: 'flex', alignItems: 'center' }}>
                <img src="/assets/cafe_menu.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,11,20,0.72) 0%, rgba(7,11,20,0.93) 100%)', pointerEvents: 'none' }} />
                <div className="hud-grid" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.3rem 0.875rem', borderRadius: 99, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', marginBottom: '1rem' }}>
                            <span className="dot-live" />
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#00e5ff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Live Menu</span>
                        </div>
                        <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: '#e2eaf7', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                            Our <span style={{ background: 'linear-gradient(90deg, #00e5ff, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Menu</span>
                        </h1>
                        <p style={{ color: 'rgba(194,211,240,0.75)', fontSize: '0.9rem' }}>Handcrafted beverages and delicious meals, made fresh daily</p>
                    </motion.div>
                </div>
            </section>

            {/* Search + Filters */}
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '1.5rem 1.25rem 0' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 12, pointerEvents: 'none' }} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..." className="input-dark" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {categories.map(c => {
                            const active = category === c;
                            const color = categoryColors[c] || '#00e5ff';
                            return (
                                <button key={c} onClick={() => setCategory(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.875rem', borderRadius: 99, fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s', background: active ? `${color}18` : 'rgba(0,0,0,0.35)', border: active ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)', color: active ? color : '#6b84b0' }}>
                                    <i className={`fa-solid ${categoryIcons[c] || 'fa-tag'}`} style={{ fontSize: 10 }} />
                                    {c === 'all' ? 'All' : c.replace('_', ' ')}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {!loading && (
                    <p style={{ fontSize: '0.73rem', color: '#3d5278', marginTop: '0.875rem' }}>
                        Showing <span style={{ color: '#00e5ff', fontWeight: 600 }}>{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Grid */}
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '1.25rem 1.25rem 4rem', flex: 1 }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(0,229,255,0.2)', borderTopColor: '#00e5ff', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-book-open" style={{ color: '#3d5278', fontSize: 40, marginBottom: 16 }} />
                        <h3 style={{ color: '#c2d3f0' }}>No Items Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem' }}>Try a different search or category</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.125rem' }}>
                        {filtered.map((item, i) => {
                            const color = categoryColors[item.category] || '#00e5ff';
                            const qtyInCart = getCartQty(item.id);
                            return (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -4 }}
                                    style={{ background: 'rgba(13,21,38,0.85)', backdropFilter: 'blur(12px)', border: qtyInCart > 0 ? `1px solid ${color}50` : `1px solid ${color}14`, borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.25s' }}>
                                    {item.image ? (
                                        <div style={{ height: 150, overflow: 'hidden', position: 'relative' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            {qtyInCart > 0 && (
                                                <div style={{ position: 'absolute', top: 8, right: 8, background: color, color: '#070b14', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                                    {qtyInCart}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ height: 130, background: `linear-gradient(135deg, ${color}10, rgba(0,0,0,0.3))`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${color}12`, position: 'relative' }}>
                                            <i className={`fa-solid ${categoryIcons[item.category] || 'fa-utensils'}`} style={{ color: `${color}70`, fontSize: 36 }} />
                                            {qtyInCart > 0 && (
                                                <div style={{ position: 'absolute', top: 8, right: 8, background: color, color: '#070b14', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                                                    {qtyInCart}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.62rem', fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 99, padding: '2px 8px' }}>
                                                <i className={`fa-solid ${categoryIcons[item.category] || 'fa-tag'}`} style={{ fontSize: 8 }} />
                                                {(item.category || 'item').replace('_', ' ')}
                                            </span>
                                            {item.preparationTime && (
                                                <span style={{ fontSize: '0.65rem', color: '#3d5278', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <i className="fa-regular fa-clock" style={{ fontSize: 9 }} /> {item.preparationTime}m
                                                </span>
                                            )}
                                        </div>

                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#c2d3f0', marginBottom: '0.35rem', lineHeight: 1.3 }}>{item.name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#3d5278', lineHeight: 1.6, flex: 1, marginBottom: '0.875rem' }}>
                                            {item.description || 'A delicious choice crafted with care from our kitchen.'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#e2eaf7' }}>
                                                LKR {parseFloat(item.price).toFixed(2)}
                                            </span>
                                            {item.isAvailable !== false ? (
                                                <button onClick={() => addToCart(item)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.875rem', borderRadius: 8, background: qtyInCart > 0 ? `${color}22` : 'rgba(0,229,255,0.08)', border: `1px solid ${qtyInCart > 0 ? color : 'rgba(0,229,255,0.25)'}`, color: qtyInCart > 0 ? color : '#00e5ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                                                    <i className={`fa-solid ${qtyInCart > 0 ? 'fa-plus' : 'fa-cart-plus'}`} style={{ fontSize: 11 }} />
                                                    {qtyInCart > 0 ? 'Add More' : 'Add to Cart'}
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 99, padding: '2px 8px' }}>Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating cart button */}
            {cartCount > 0 && !cartOpen && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setCartOpen(true)}
                    style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #00e5ff, #0077ff)', color: '#070b14', border: 'none', borderRadius: 99, padding: '0.75rem 1.25rem', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,229,255,0.35)' }}>
                    <i className="fa-solid fa-cart-shopping" />
                    Cart ({cartCount}) — LKR {cartTotal.toFixed(2)}
                </motion.button>
            )}

            {/* Cart Sidebar */}
            <AnimatePresence>
                {cartOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setCartOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200 }} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420, background: '#0a1020', borderLeft: '1px solid rgba(0,229,255,0.15)', zIndex: 201, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", color: '#e2eaf7', fontWeight: 700, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <i className="fa-solid fa-cart-shopping" style={{ color: '#00e5ff' }} /> Your Order
                                </h2>
                                <button onClick={() => setCartOpen(false)} style={{ background: 'transparent', border: 'none', color: '#3d5278', fontSize: 20, cursor: 'pointer' }}>
                                    <i className="fa-solid fa-xmark" />
                                </button>
                            </div>

                            {/* Cart items */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {cart.length === 0 ? (
                                    <p style={{ color: '#3d5278', textAlign: 'center', marginTop: '3rem' }}>Your cart is empty</p>
                                ) : cart.map(({ item, quantity }) => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: '#c2d3f0', fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{item.name}</p>
                                            <p style={{ color: '#3d5278', fontSize: '0.75rem' }}>LKR {parseFloat(item.price).toFixed(2)} each</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => changeQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa-solid fa-minus" style={{ fontSize: 10 }} />
                                            </button>
                                            <span style={{ color: '#e2eaf7', fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{quantity}</span>
                                            <button onClick={() => changeQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                                            </button>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: 80 }}>
                                            <p style={{ color: '#00e5ff', fontWeight: 700, fontSize: '0.875rem' }}>LKR {(parseFloat(item.price) * quantity).toFixed(2)}</p>
                                            <button onClick={() => removeFromCart(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11, marginTop: 2 }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order options */}
                            {cart.length > 0 && (
                                <div style={{ borderTop: '1px solid rgba(0,229,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                    <div style={{ marginBottom: '0.875rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Order Type</label>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {['dine-in', 'takeaway', 'online'].map(t => (
                                                <button key={t} onClick={() => setOrderType(t)}
                                                    style={{ flex: 1, padding: '0.4rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', background: orderType === t ? 'rgba(0,229,255,0.12)' : 'rgba(0,0,0,0.4)', border: orderType === t ? '1px solid rgba(0,229,255,0.4)' : '1px solid rgba(255,255,255,0.06)', color: orderType === t ? '#00e5ff' : '#6b84b0', textTransform: 'capitalize' }}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {orderType === 'dine-in' && (
                                        <div style={{ marginBottom: '0.875rem' }}>
                                            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Table Number</label>
                                            <input type="number" min="1" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. 4" className="input-dark" />
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ color: '#6b84b0', fontSize: '0.875rem' }}>Total</span>
                                        <span style={{ fontFamily: "'Rajdhani', sans-serif", color: '#00e5ff', fontWeight: 800, fontSize: '1.25rem' }}>LKR {cartTotal.toFixed(2)}</span>
                                    </div>

                                    <button onClick={handlePlaceOrder} disabled={placingOrder}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: 10, background: 'linear-gradient(135deg, #00e5ff, #0077ff)', color: '#070b14', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: placingOrder ? 'not-allowed' : 'pointer', opacity: placingOrder ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {placingOrder ? (<><i className="fa-solid fa-spinner fa-spin" /> Placing Order...</>) : (<><i className="fa-solid fa-paper-plane" /> Place Order</>)}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default CustomerMenu;
