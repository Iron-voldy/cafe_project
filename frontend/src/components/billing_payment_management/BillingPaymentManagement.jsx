// futuristic dark billing & payment management — preserves all logic
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaXmark, FaDownload } from 'react-icons/fa6';
import API from '../../services/api';
import toast from 'react-hot-toast';

const FieldLabel = ({ icon, children }) => (
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#6b84b0', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>
        {icon && <i className={`fa-solid ${icon} mr-1.5`} style={{ color: 'rgba(0,229,255,0.6)', fontSize: 10 }}></i>}
        {children}
    </label>
);

const ModalBox = ({ title, icon, accent, onClose, children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            style={{ background: '#0d1526', border: `1px solid ${accent || 'rgba(0,229,255,0.18)'}`, borderRadius: '1.25rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 0 60px ${accent || 'rgba(0,229,255,0.1)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0,229,255,0.08)', background: 'rgba(0,229,255,0.02)' }}>
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#e2eaf7', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className={`fa-solid ${icon}`} style={{ color: accent || '#00e5ff', fontSize: 14 }}></i> {title}
                </h2>
                <button onClick={onClose} style={{ color: '#3d5278', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="hover:text-[#e2eaf7]">
                    <FaXmark size={18} />
                </button>
            </div>
            {children}
        </motion.div>
    </motion.div>
);

const BillingPaymentManagement = () => {
    const [activeTab, setActiveTab] = useState('payments');
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ orderId: '', amount: '', tax: '0', discount: '0', paymentMethod: 'cash', paymentStatus: 'pending', paidBy: '' });
    const [orders, setOrders] = useState([]);
    const [invoiceForm, setInvoiceForm] = useState({ paymentId: '', customerName: '', customerEmail: '', subtotal: '', tax: '', discount: '', status: 'draft' });
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [payRes, invRes, ordRes] = await Promise.all([
                API.get('/payments').catch(() => ({ data: [] })),
                API.get('/payments/invoices').catch(() => ({ data: [] })),
                API.get('/orders').catch(() => ({ data: [] }))
            ]);
            setPayments(payRes.data); setInvoices(invRes.data); setOrders(ordRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const selectOrder = (orderId) => {
        const order = orders.find(o => o.id === parseInt(orderId));
        setFormData(f => ({
            ...f,
            orderId,
            amount: order ? parseFloat(order.totalAmount).toFixed(2) : f.amount,
            paidBy: order ? order.customerName : f.paidBy,
        }));
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!formData.orderId) { toast.error('Please select an order'); return; }
        if (!formData.amount || parseFloat(formData.amount) <= 0) { toast.error('Amount must be greater than 0'); return; }
        try {
            const payload = {
                orderId: parseInt(formData.orderId),
                amount: parseFloat(formData.amount),
                tax: parseFloat(formData.tax || 0),
                discount: parseFloat(formData.discount || 0),
                paymentMethod: formData.paymentMethod,
                paymentStatus: formData.paymentStatus,
                paidBy: formData.paidBy,
            };
            if (editingItem) { await API.put(`/payments/${editingItem.id}`, payload); toast.success('Payment updated'); }
            else { await API.post('/payments', payload); toast.success('Payment created'); }
            fetchData(); setShowModal(false);
            setFormData({ orderId: '', amount: '', tax: '0', discount: '0', paymentMethod: 'cash', paymentStatus: 'pending', paidBy: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save payment'); }
    };

    const handleInvoiceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInvoice) { await API.put(`/payments/invoices/${editingInvoice.id}`, invoiceForm); toast.success('Invoice updated'); }
            else { await API.post('/payments/invoices', invoiceForm); toast.success('Invoice created'); }
            fetchData(); setShowInvoiceModal(false);
        } catch { toast.error('Failed to save invoice'); }
    };

    const handleDelete = async (id, type) => {
        if (!confirm(`Delete this ${type}?`)) return;
        try { await API.delete(`/payments${type === 'invoice' ? '/invoices' : ''}/${id}`); toast.success(`${type} deleted`); fetchData(); }
        catch { toast.error('Failed to delete'); }
    };

    const openEditPayment = (p) => { setEditingItem(p); setFormData({ orderId: p.orderId, amount: p.amount, paymentMethod: p.paymentMethod, paymentStatus: p.paymentStatus }); setShowModal(true); };
    const openEditInvoice = (inv) => { setEditingInvoice(inv); setInvoiceForm({ paymentId: inv.paymentId, customerName: inv.customerName, customerEmail: inv.customerEmail || '', subtotal: inv.subtotal, tax: inv.tax, discount: inv.discount, status: inv.status }); setShowInvoiceModal(true); };

    const filteredPayments = payments.filter(p => p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) || p.paymentStatus?.toLowerCase().includes(search.toLowerCase()));
    const filteredInvoices = invoices.filter(inv => inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()));

    const totalRevenue = payments.filter(p => p.paymentStatus === 'completed').reduce((s, p) => s + parseFloat(p.totalAmount || p.amount || 0), 0);
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed').length;
    const pendingInvoices = invoices.filter(i => i.status === 'draft').length;

    const generateInvoicePDF = (inv) => {
        const w = window.open('', '_blank', 'width=800,height=600');
        w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}h1{font-size:28px;color:#d97706;margin-bottom:4px}.inv-num{font-size:14px;color:#888;margin-bottom:30px}.table{width:100%;border-collapse:collapse;margin:20px 0}.table th,.table td{text-align:left;padding:10px 12px;border-bottom:1px solid #eee}.table th{background:#fef3c7;font-size:12px;text-transform:uppercase;color:#92400e}.total-row{font-weight:bold;font-size:16px;background:#fffbeb}.info{display:flex;justify-content:space-between;margin-bottom:20px}.info div{font-size:13px;line-height:1.8}.footer{margin-top:30px;text-align:center;font-size:11px;color:#aaa}@media print{body{padding:20px}}</style></head><body><h1>CafeSync Invoice</h1><p class="inv-num">${inv.invoiceNumber}</p><div class="info"><div><strong>Customer:</strong> ${inv.customerName || '—'}<br><strong>Email:</strong> ${inv.customerEmail || '—'}</div><div><strong>Date:</strong> ${new Date(inv.createdAt).toLocaleDateString()}<br><strong>Status:</strong> ${inv.status}</div></div><table class="table"><thead><tr><th>Description</th><th style="text-align:right">Amount (LKR)</th></tr></thead><tbody><tr><td>Subtotal</td><td style="text-align:right">${parseFloat(inv.subtotal).toFixed(2)}</td></tr><tr><td>Tax</td><td style="text-align:right">${parseFloat(inv.tax).toFixed(2)}</td></tr><tr><td>Discount</td><td style="text-align:right">-${parseFloat(inv.discount).toFixed(2)}</td></tr><tr class="total-row"><td>Grand Total</td><td style="text-align:right">LKR ${parseFloat(inv.grandTotal || 0).toFixed(2)}</td></tr></tbody></table><div class="footer"><p>Thank you for your business — CafeSync</p></div></body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 400);
    };

    const inputCls = 'input-dark';

    const summaryStats = [
        { label: 'Total Revenue', value: `LKR ${totalRevenue.toFixed(2)}`, icon: 'fa-chart-line', color: '#10b981' },
        { label: 'Completed', value: completedPayments, icon: 'fa-circle-check', color: '#00e5ff' },
        { label: 'Draft Invoices', value: pendingInvoices, icon: 'fa-clock', color: '#f59e0b' },
    ];

    const payStatusBadge = (s) => ({ completed: 'badge-success', failed: 'badge-danger', pending: 'badge-warning', refunded: 'badge-info' }[s] || 'badge-muted');
    const invStatusBadge = (s) => ({ paid: 'badge-success', draft: 'badge-warning', sent: 'badge-info', cancelled: 'badge-danger' }[s] || 'badge-muted');

    return (
        <div style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
                <div>
                    <h1 className="page-title"><i className="fa-solid fa-credit-card" style={{ color: '#10b981', marginRight: 10 }}></i>Billing &amp; Payments</h1>
                    <p className="page-subtitle">Manage all payments and invoices</p>
                </div>
                <button onClick={() => {
                if (activeTab === 'payments') { setEditingItem(null); setFormData({ orderId: '', amount: '', tax: '0', discount: '0', paymentMethod: 'cash', paymentStatus: 'pending', paidBy: '' }); setShowModal(true); }
                    else { setEditingInvoice(null); setInvoiceForm({ paymentId: '', customerName: '', customerEmail: '', subtotal: '', tax: '', discount: '', status: 'draft' }); setShowInvoiceModal(true); }
                }} className="btn-solid-cyan">
                    <FaPlus style={{ fontSize: 12 }} /> New {activeTab === 'payments' ? 'Payment' : 'Invoice'}
                </button>
            </motion.div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {summaryStats.map(({ label, value, icon, color }, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card" style={{ borderColor: `${color}18` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className={`fa-solid ${icon}`} style={{ color, fontSize: 13 }}></i>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#6b84b0', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</span>
                        </div>
                        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#e2eaf7' }}>{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tabs + Search */}
            <div className="section-card" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 3, border: '1px solid rgba(0,229,255,0.1)' }}>
                        {['payments', 'invoices'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                style={{ padding: '0.4rem 1rem', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: activeTab === tab ? 'rgba(0,229,255,0.12)' : 'transparent', border: activeTab === tab ? '1px solid rgba(0,229,255,0.25)' : '1px solid transparent', color: activeTab === tab ? '#00e5ff' : '#6b84b0', transition: 'all 0.2s' }}>
                                <i className={`fa-solid ${tab === 'payments' ? 'fa-credit-card' : 'fa-file-invoice'} mr-1.5`} style={{ fontSize: 11 }}></i>
                                {tab === 'payments' ? 'Payments' : 'Invoices'}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#3d5278', fontSize: 12, pointerEvents: 'none' }}></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className={inputCls} style={{ paddingLeft: '2.5rem', padding: '0.45rem 0.875rem 0.45rem 2.5rem' }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', animation: 'spin 0.8s linear infinite' }} />
                </div>
            ) : activeTab === 'payments' ? (
                filteredPayments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-credit-card" style={{ color: '#10b981', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Payments Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Start by recording your first payment</p>
                        <button onClick={() => { setEditingItem(null); setFormData({ orderId: '', amount: '', paymentMethod: 'cash', paymentStatus: 'pending' }); setShowModal(true); }} className="btn-solid-cyan">
                            <FaPlus style={{ fontSize: 11 }} /> New Payment
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
                        {filteredPayments.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                                style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.28)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.12)'}>
                                <div style={{ padding: '1rem 1.125rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <span style={{ fontSize: '0.72rem', color: '#3d5278', fontWeight: 600 }}>Payment #{p.id}</span>
                                        <span className={`badge ${payStatusBadge(p.paymentStatus)}`}>{p.paymentStatus}</span>
                                    </div>
                                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: 8 }}>LKR {parseFloat(p.amount).toFixed(2)}</p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.77rem', color: '#6b84b0' }}>
                                        <span><i className="fa-solid fa-wallet mr-1" style={{ fontSize: 10, color: '#3d5278' }}></i><span style={{ textTransform: 'capitalize' }}>{p.paymentMethod}</span></span>
                                        <span><i className="fa-solid fa-cart-shopping mr-1" style={{ fontSize: 10, color: '#3d5278' }}></i>Order #{p.orderId}</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => openEditPayment(p)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit</button>
                                    <button onClick={() => handleDelete(p.id, 'payment')} className="btn-danger" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : (
                filteredInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                            <i className="fa-solid fa-file-invoice" style={{ color: '#a855f7', fontSize: 24 }}></i>
                        </div>
                        <h3 style={{ color: '#c2d3f0', fontWeight: 700, marginBottom: 6 }}>No Invoices Found</h3>
                        <p style={{ color: '#3d5278', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Create your first invoice</p>
                        <button onClick={() => { setEditingInvoice(null); setInvoiceForm({ paymentId: '', customerName: '', customerEmail: '', subtotal: '', tax: '', discount: '', status: 'draft' }); setShowInvoiceModal(true); }} className="btn-solid-cyan">
                            <FaPlus style={{ fontSize: 11 }} /> New Invoice
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1rem' }}>
                        {filteredInvoices.map((inv, i) => (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }}
                                style={{ background: 'rgba(13,21,38,0.7)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: '0.875rem', overflow: 'hidden', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.28)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(168,85,247,0.12)'}>
                                <div style={{ padding: '1rem 1.125rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: '#a855f7', letterSpacing: '0.04em' }}>{inv.invoiceNumber}</span>
                                        <span className={`badge ${invStatusBadge(inv.status)}`}>{inv.status}</span>
                                    </div>
                                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#e2eaf7', marginBottom: 8 }}>LKR {parseFloat(inv.grandTotal || 0).toFixed(2)}</p>
                                    <div style={{ display: 'flex', gap: 10, fontSize: '0.72rem', color: '#6b84b0' }}>
                                        <span>Tax: LKR {parseFloat(inv.tax || 0).toFixed(2)}</span>
                                        <span>Disc: LKR {parseFloat(inv.discount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => generateInvoicePDF(inv)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0.28rem 0.7rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                                        <FaDownload style={{ fontSize: 9 }} /> PDF
                                    </button>
                                    <button onClick={() => openEditInvoice(inv)} className="btn-neon-cyan" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-pen" style={{ fontSize: 10 }}></i> Edit</button>
                                    <button onClick={() => handleDelete(inv.id, 'invoice')} className="btn-danger" style={{ padding: '0.28rem 0.7rem', fontSize: '0.7rem' }}><i className="fa-solid fa-trash" style={{ fontSize: 10 }}></i> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}

            {/* Payment Modal */}
            <AnimatePresence>
                {showModal && (
                    <ModalBox title={editingItem ? 'Edit Payment' : 'New Payment'} icon="fa-credit-card" accent="rgba(16,185,129,0.2)" onClose={() => setShowModal(false)}>
                        <form onSubmit={handlePaymentSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <FieldLabel icon="fa-cart-shopping">Order</FieldLabel>
                                <select value={formData.orderId} onChange={e => selectOrder(e.target.value)} required className={inputCls}>
                                    <option value="">-- Select Order --</option>
                                    {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName} (LKR {parseFloat(o.totalAmount || 0).toFixed(2)})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-coins">Amount (LKR)</FieldLabel><input type="number" step="0.01" min="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required className={inputCls} placeholder="0.00" /></div>
                                <div><FieldLabel icon="fa-user">Paid By</FieldLabel><input type="text" value={formData.paidBy} onChange={e => setFormData({ ...formData, paidBy: e.target.value })} className={inputCls} placeholder="Customer name" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-percent">Tax (LKR)</FieldLabel><input type="number" step="0.01" min="0" value={formData.tax} onChange={e => setFormData({ ...formData, tax: e.target.value })} className={inputCls} placeholder="0.00" /></div>
                                <div><FieldLabel icon="fa-tag">Discount (LKR)</FieldLabel><input type="number" step="0.01" min="0" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} className={inputCls} placeholder="0.00" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-wallet">Method</FieldLabel>
                                    <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className={inputCls}>
                                        <option value="cash">Cash</option><option value="card">Card</option><option value="online">Online</option>
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel icon="fa-circle-dot">Status</FieldLabel>
                                    <select value={formData.paymentStatus} onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })} className={inputCls}>
                                        <option value="pending">Pending</option><option value="completed">Completed</option><option value="refunded">Refunded</option><option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                            {formData.amount && formData.tax !== undefined && (
                                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, padding: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b84b0', fontSize: '0.8rem' }}>Total</span>
                                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: '#10b981' }}>LKR {(parseFloat(formData.amount || 0) + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0)).toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingItem ? 'Update' : 'Create'} Payment</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>

            {/* Invoice Modal */}
            <AnimatePresence>
                {showInvoiceModal && (
                    <ModalBox title={editingInvoice ? 'Edit Invoice' : 'New Invoice'} icon="fa-file-invoice" accent="rgba(168,85,247,0.2)" onClose={() => setShowInvoiceModal(false)}>
                        <form onSubmit={handleInvoiceSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <FieldLabel icon="fa-credit-card">Payment</FieldLabel>
                                    <select value={invoiceForm.paymentId} onChange={e => setInvoiceForm({ ...invoiceForm, paymentId: e.target.value })} required className={inputCls}>
                                        <option value="">Select Payment</option>
                                        {payments.map(p => <option key={p.id} value={p.id}>#{p.paymentNumber || p.id} - LKR {parseFloat(p.amount || 0).toFixed(2)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <FieldLabel icon="fa-circle-dot">Status</FieldLabel>
                                    <select value={invoiceForm.status} onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })} className={inputCls}>
                                        <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-user">Customer Name</FieldLabel><input type="text" value={invoiceForm.customerName} onChange={e => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} required className={inputCls} placeholder="Customer name" /></div>
                                <div><FieldLabel icon="fa-envelope">Customer Email</FieldLabel><input type="email" value={invoiceForm.customerEmail} onChange={e => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })} className={inputCls} placeholder="Email (optional)" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                <div><FieldLabel icon="fa-coins">Subtotal</FieldLabel><input type="number" step="0.01" value={invoiceForm.subtotal} onChange={e => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} required className={inputCls} placeholder="0.00" /></div>
                                <div><FieldLabel icon="fa-percent">Tax</FieldLabel><input type="number" step="0.01" value={invoiceForm.tax} onChange={e => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} className={inputCls} placeholder="0.00" /></div>
                                <div><FieldLabel icon="fa-tag">Discount</FieldLabel><input type="number" step="0.01" value={invoiceForm.discount} onChange={e => setInvoiceForm({ ...invoiceForm, discount: e.target.value })} className={inputCls} placeholder="0.00" /></div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn-neon-cyan" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn-solid-cyan" style={{ flex: 1, justifyContent: 'center' }}>{editingInvoice ? 'Update' : 'Create'} Invoice</button>
                            </div>
                        </form>
                    </ModalBox>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BillingPaymentManagement;
