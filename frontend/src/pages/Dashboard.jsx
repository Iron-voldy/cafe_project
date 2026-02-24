// dashboard with improved stat cards, empty states with CTAs, balanced layout
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaDollarSign, FaBookOpen, FaCalendarAlt, FaChartLine, FaPlus, FaClock, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ orders: 0, payments: 0, menuItems: 0, tables: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, paymentsRes, menuRes, tablesRes] = await Promise.all([
                    API.get('/orders').catch(() => ({ data: [] })),
                    API.get('/payments').catch(() => ({ data: [] })),
                    API.get('/menu/items').catch(() => ({ data: [] })),
                    API.get('/tables/tables').catch(() => ({ data: [] }))
                ]);
                setStats({
                    orders: ordersRes.data.length,
                    payments: paymentsRes.data.length,
                    menuItems: menuRes.data.length,
                    tables: tablesRes.data.length
                });
                setRecentOrders(ordersRes.data.slice(0, 5));
            } catch (error) {
                console.log('Error fetching stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { title: 'Total Orders', value: stats.orders, icon: FaShoppingCart, color: 'bg-blue-500', lightBg: 'bg-blue-50', link: '/orders' },
        { title: 'Payments', value: stats.payments, icon: FaDollarSign, color: 'bg-green-500', lightBg: 'bg-green-50', link: '/payments' },
        { title: 'Menu Items', value: stats.menuItems, icon: FaBookOpen, color: 'bg-orange-500', lightBg: 'bg-orange-50', link: '/menu' },
        { title: 'Tables', value: stats.tables, icon: FaCalendarAlt, color: 'bg-purple-500', lightBg: 'bg-purple-50', link: '/tables' }
    ];

    const quickActions = [
        { title: 'New Order', icon: FaShoppingCart, link: '/orders', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        { title: 'Add Menu Item', icon: FaBookOpen, link: '/menu', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        { title: 'New Reservation', icon: FaCalendarAlt, link: '/tables', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        { title: 'Process Payment', icon: FaDollarSign, link: '/payments', color: 'bg-green-50 text-green-600 hover:bg-green-100' }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#FFF8F0]">


            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* welcome */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-2xl font-bold text-amber-900">Welcome back, {user?.firstName || 'User'} 👋</h1>
                    <p className="text-amber-900-light/50 text-sm mt-1">Here's what's happening in your cafe today</p>
                </motion.div>

                {/* stat cards — 4 in a row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((card, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="hover:scale-\[1\.02\] transition-transform duration-200">
                            <Link to={card.link} className="block bg-white rounded-xl p-5 shadow-sm border border-warm/40">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                                        <card.icon className="text-white text-base" />
                                    </div>
                                    <FaChartLine className="text-success text-sm" />
                                </div>
                                <p className="text-2xl font-bold text-amber-900">{loading ? '...' : card.value}</p>
                                <p className="text-xs text-amber-900-light/50 mt-0.5">{card.title}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* quick actions + recent orders — 1fr 2fr split */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
                    {/* quick actions */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-5 shadow-sm border border-warm/40">
                        <h2 className="text-sm font-bold text-amber-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {quickActions.map((action, i) => (
                                <Link key={i} to={action.link} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                                    <action.icon className="text-xl" />
                                    <span className="text-[11px] font-medium text-center leading-tight">{action.title}</span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* recent orders */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-5 shadow-sm border border-warm/40">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-amber-900">Recent Orders</h2>
                            <Link to="/orders" className="text-amber-600 text-xs font-medium hover:text-accent transition-colors flex items-center gap-1">
                                View All <FaArrowRight size={11} />
                            </Link>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="space-y-2.5">
                                {recentOrders.map((order, i) => (
                                    <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                                        className="flex items-center justify-between p-3 bg-[#FFF8F0] rounded-lg hover:bg-orange-50/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                <FaShoppingCart className="text-blue-600 text-xs" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-amber-900">{order.orderNumber}</p>
                                                <p className="text-[10px] text-amber-900-light/50">{order.customerName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-amber-900">LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-success/15 text-success' : order.status === 'pending' ? 'bg-warning/15 text-warning' : 'bg-info/15 text-info'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            /* enhanced empty state with illustration + CTA */
                            <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8 border-none shadow-none min-h-[250px] py-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                                    <FaClock className="text-2xl" />
                                </div>
                                <h3 className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-title text-sm">No orders yet</h3>
                                <p className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 my-8-desc text-xs mb-4">Start by creating your first order</p>
                                <Link to="/orders" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 py-2 px-4 shadow-sm hover:scale-\[1\.02\] transition-transform duration-200">
                                    <FaPlus size={14} /> New Order
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>


        </div>
    );
};

export default Dashboard;
