// billing & payment management with summary cards, improved tabs, better empty state
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign, FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaFileAlt, FaChartLine, FaClock, FaCheckCircle, FaDownload } from 'react-icons/fa';

import API from '../../services/api';
import toast from 'react-hot-toast';

const BillingPaymentManagement = () => {
    const [activeTab, setActiveTab] = useState('payments');
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ orderId: '', amount: '', paymentMethod: 'cash', paymentStatus: 'pending' });
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
            setPayments(payRes.data);
            setInvoices(invRes.data);
            setOrders(ordRes.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) { await API.put(`/payments/${editingItem.id}`, formData); toast.success('Payment updated'); }
            else { await API.post('/payments', formData); toast.success('Payment created'); }
            fetchData(); setShowModal(false);
        } catch { toast.error('Failed to save payment'); }
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
        try {
            await API.delete(`/payments${type === 'invoice' ? '/invoices' : ''}/${id}`);
            toast.success(`${type} deleted`); fetchData();
        } catch { toast.error('Failed to delete'); }
    };

    const openEditPayment = (p) => { setEditingItem(p); setFormData({ orderId: p.orderId, amount: p.amount, paymentMethod: p.paymentMethod, paymentStatus: p.paymentStatus }); setShowModal(true); };
    const openEditInvoice = (inv) => { setEditingInvoice(inv); setInvoiceForm({ paymentId: inv.paymentId, customerName: inv.customerName, customerEmail: inv.customerEmail || '', subtotal: inv.subtotal, tax: inv.tax, discount: inv.discount, status: inv.status }); setShowInvoiceModal(true); };

    const filteredPayments = payments.filter(p => p.paymentMethod?.toLowerCase().includes(search.toLowerCase()) || p.status?.toLowerCase().includes(search.toLowerCase()));
    const filteredInvoices = invoices.filter(inv => inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()));

    // summary stats
    const totalRevenue = payments.filter(p => p.paymentStatus === 'completed').reduce((s, p) => s + parseFloat(p.totalAmount || p.amount || 0), 0);
    const completedPayments = payments.filter(p => p.paymentStatus === 'completed').length;
    const pendingInvoices = invoices.filter(i => i.status === 'draft').length;

    const generateInvoicePDF = (inv) => {
        const w = window.open('', '_blank', 'width=800,height=600');
        w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}h1{font-size:28px;color:#d97706;margin-bottom:4px}.inv-num{font-size:14px;color:#888;margin-bottom:30px}.table{width:100%;border-collapse:collapse;margin:20px 0}.table th,.table td{text-align:left;padding:10px 12px;border-bottom:1px solid #eee}.table th{background:#fef3c7;font-size:12px;text-transform:uppercase;color:#92400e}.total-row{font-weight:bold;font-size:16px;background:#fffbeb}.info{display:flex;justify-content:space-between;margin-bottom:20px}.info div{font-size:13px;line-height:1.8}.footer{margin-top:30px;text-align:center;font-size:11px;color:#aaa}@media print{body{padding:20px}}</style></head><body><h1>CafeSync Invoice</h1><p class="inv-num">${inv.invoiceNumber}</p><div class="info"><div><strong>Customer:</strong> ${inv.customerName || '—'}<br><strong>Email:</strong> ${inv.customerEmail || '—'}</div><div><strong>Date:</strong> ${new Date(inv.createdAt).toLocaleDateString()}<br><strong>Status:</strong> ${inv.status}</div></div><table class="table"><thead><tr><th>Description</th><th style="text-align:right">Amount (LKR)</th></tr></thead><tbody><tr><td>Subtotal</td><td style="text-align:right">${parseFloat(inv.subtotal).toFixed(2)}</td></tr><tr><td>Tax</td><td style="text-align:right">${parseFloat(inv.tax).toFixed(2)}</td></tr><tr><td>Discount</td><td style="text-align:right">-${parseFloat(inv.discount).toFixed(2)}</td></tr><tr class="total-row"><td>Grand Total</td><td style="text-align:right">LKR ${parseFloat(inv.grandTotal || 0).toFixed(2)}</td></tr></tbody></table><div class="footer"><p>Thank you for your business — CafeSync</p></div></body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 400);
    };

    return (
        <>
            {/* header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-amber-900 flex items-center gap-2"><FaDollarSign className="text-amber-600" /> Billing & Payments</h1>
                    <p className="text-amber-900-light/50 text-xs mt-0.5">Manage all payments and invoices.</p>
                </div>
                <button onClick={() => { activeTab === 'payments' ? (setEditingItem(null), setFormData({ orderId: '', amount: '', paymentMethod: 'cash', paymentStatus: 'pending' }), setShowModal(true)) : (setEditingInvoice(null), setInvoiceForm({ paymentId: '', customerName: '', customerEmail: '', subtotal: '', tax: '', discount: '', status: 'draft' }), setShowInvoiceModal(true)); }} className="flex items-center gap-1.5 bg-amber-600 text-amber-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors shadow-sm cursor-pointer">
                    <FaPlus size={15} /> New {activeTab === 'payments' ? 'Payment' : 'Invoice'}
                </button>
            </motion.div>

            {/* summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><FaChartLine className="text-green-600 text-sm" /></div>
                        <span className="text-xs text-amber-900-light/50">Total Revenue</span>
                    </div>
                    <p className="text-lg font-bold text-amber-900">LKR {totalRevenue.toFixed(2)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FaCheckCircle className="text-blue-600 text-sm" /></div>
                        <span className="text-xs text-amber-900-light/50">Completed</span>
                    </div>
                    <p className="text-lg font-bold text-amber-900">{completedPayments}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border border-warm/40">
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><FaClock className="text-orange-600 text-sm" /></div>
                        <span className="text-xs text-amber-900-light/50">Pending Invoices</span>
                    </div>
                    <p className="text-lg font-bold text-amber-900">{pendingInvoices}</p>
                </motion.div>
            </div>

            {/* tabs + search row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex bg-orange-50/20 rounded-lg p-1 shrink-0">
                    {['payments', 'invoices'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer flex-1 sm:flex-none ${activeTab === tab ? 'bg-white text-amber-900 shadow-sm' : 'text-amber-900-light/50 hover:text-amber-900'}`}>
                            {tab === 'payments' ? 'Payments' : 'Invoices'}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-[300px] w-full sm:w-auto">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-900-light/40 text-sm" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="w-full pl-9 pr-4 py-2.5 bg-white border border-warm/50 rounded-lg text-sm focus:outline-none focus:border-secondary transition-colors" />
                </div>
            </div>

            {/* content */}
            {loading ? (
                <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-3 border-secondary border-t-transparent" /></div>
            ) : activeTab === 'payments' ? (
                filteredPayments.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-green-400"><FaDollarSign className="text-3xl" /></div>
                        <h3 className="text-base font-bold text-amber-900 mb-1">No Payments Found</h3>
                        <p className="text-sm text-amber-900-light/50 mb-4">Start by recording your first payment</p>
                        <button onClick={() => { setEditingItem(null); setFormData({ orderId: '', amount: '', paymentMethod: 'cash', paymentStatus: 'pending' }); setShowModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-[1.02] transition-transform duration-200 mt-2"><FaPlus size={14} /> New Payment</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredPayments.map((p, i) => (
                            <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all">
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-amber-900-light/50">Payment #{p.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.paymentStatus === 'completed' ? 'bg-success/15 text-success' : p.paymentStatus === 'failed' ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>{p.paymentStatus}</span>
                                    </div>
                                    <p className="text-xl font-bold text-amber-900">LKR {parseFloat(p.amount).toFixed(2)}</p>
                                    <p className="text-xs text-amber-900-light/60">Method: <span className="font-medium text-amber-900 capitalize">{p.paymentMethod}</span></p>
                                    <p className="text-xs text-amber-900-light/60">Order: <span className="font-medium text-amber-900">#{p.orderId}</span></p>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => openEditPayment(p)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                    <button onClick={() => handleDelete(p.id, 'payment')} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            ) : (
                filteredInvoices.length === 0 ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-5 text-purple-400"><FaFileAlt className="text-3xl" /></div>
                        <h3 className="text-base font-bold text-amber-900 mb-1">No Invoices Found</h3>
                        <p className="text-sm text-amber-900-light/50 mb-4">Create your first invoice</p>
                        <button onClick={() => { setEditingInvoice(null); setInvoiceForm({ paymentId: '', customerName: '', customerEmail: '', subtotal: '', tax: '', discount: '', status: 'draft' }); setShowInvoiceModal(true); }} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2.5 px-6 shadow-sm hover:scale-[1.02] transition-transform duration-200 mt-2"><FaPlus size={14} /> New Invoice</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredInvoices.map((inv, i) => (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -3 }} className="bg-white rounded-xl shadow-sm border border-warm/40 overflow-hidden hover:border-secondary/40 transition-all">
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-amber-900">{inv.invoiceNumber}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${inv.status === 'paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>{inv.status}</span>
                                    </div>
                                    <p className="text-lg font-bold text-amber-900">LKR {parseFloat(inv.grandTotal || 0).toFixed(2)}</p>
                                    <div className="flex justify-between text-[10px] text-amber-900-light/50">
                                        <span>Tax: LKR {parseFloat(inv.tax).toFixed(2)}</span>
                                        <span>Discount: LKR {parseFloat(inv.discount).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button onClick={() => generateInvoicePDF(inv)} className="text-green-600 hover:bg-green-50"><FaDownload size={13} /> PDF</button>
                                    <button onClick={() => openEditInvoice(inv)} className="text-info hover:bg-info/10"><FaEdit size={13} /> Edit</button>
                                    <button onClick={() => handleDelete(inv.id, 'invoice')} className="text-danger hover:bg-danger/10"><FaTrash size={13} /> Delete</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )
            )}


            {/* payment modal */}
            < AnimatePresence >
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingItem ? 'Edit Payment' : 'New Payment'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Order</label><select value={formData.orderId} onChange={(e) => { const ord = orders.find(o => o.id === parseInt(e.target.value)); setFormData({ ...formData, orderId: e.target.value, amount: ord ? parseFloat(ord.totalAmount || 0).toFixed(2) : '' }); }} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="">-- Select Order --</option>{orders.map(o => (<option key={o.id} value={o.id}>{o.orderNumber} — {o.customerName} (LKR {parseFloat(o.totalAmount || 0).toFixed(2)})</option>))}</select></div>
                                <div><label className="block text-xs font-medium text-amber-900 mb-1">Amount (LKR)</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Method</label><select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="cash">Cash</option><option value="card">Card</option><option value="online">Online</option></select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Status</label><select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="pending">Pending</option><option value="completed">Completed</option><option value="refunded">Refunded</option><option value="failed">Failed</option></select></div>
                                </div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingItem ? 'Update' : 'Create'}</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )
                }
            </AnimatePresence >

            {/* invoice modal */}
            < AnimatePresence >
                {showInvoiceModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-5 border-b border-warm/40">
                                <h2 className="text-lg font-bold text-amber-900">{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
                                <button onClick={() => setShowInvoiceModal(false)} className="text-amber-900-light/40 hover:text-amber-900 cursor-pointer"><FaTimes size={18} /></button>
                            </div>
                            <form onSubmit={handleInvoiceSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Payment ID</label><select value={invoiceForm.paymentId} onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentId: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="">Select Payment</option>{payments.map(p => <option key={p.id} value={p.id}>#{p.paymentNumber || p.id} - LKR {parseFloat(p.amount || 0).toFixed(2)}</option>)}</select></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Status</label><select value={invoiceForm.status} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Customer Name</label><input type="text" value={invoiceForm.customerName} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Customer name" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Customer Email</label><input type="email" value={invoiceForm.customerEmail} onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="Email (optional)" /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Subtotal</label><input type="number" step="0.01" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: e.target.value })} required className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Tax</label><input type="number" step="0.01" value={invoiceForm.tax} onChange={(e) => setInvoiceForm({ ...invoiceForm, tax: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                    <div><label className="block text-xs font-medium text-amber-900 mb-1">Discount</label><input type="number" step="0.01" value={invoiceForm.discount} onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all" placeholder="0.00" /></div>
                                </div>
                                <div className="flex gap-2.5 pt-2"><button type="button" onClick={() => setShowInvoiceModal(false)} className="bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 flex-1">Cancel</button><button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 flex-1">{editingInvoice ? 'Update' : 'Create'}</button></div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default BillingPaymentManagement;
