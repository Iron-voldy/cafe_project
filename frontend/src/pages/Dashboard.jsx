// dashboard — role-aware, works inside Layout.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaDollarSign, FaBookOpen, FaCalendarAlt, FaChartLine, FaPlus, FaClock, FaArrowRight, FaUser, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const isCustomer = user?.role === 'customer';
    const [stats, setStats] = useState({ orders: 0, payments: 0, menuItems: 0, tables: 0, myOrders: 0, myReservations: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, paymentsRes, menuRes, tablesRes, reservationsRes] = await Promise.all([
                    API.get('/orders').catch(() => ({ data: [] })),
                    API.get('/payments').catch(() => ({ data: [] })),
                    API.get('/menu/items').catch(() => ({ data: [] })),
                    API.get('/tables/tables').catch(() => ({ data: [] })),
                    API.get('/tables/reservations').catch(() => ({ data: [] }))
                ]);

                const allOrders = ordersRes.data;
                const myOrders = allOrders.filter(o => o.customerId === user?.id || o.customerName === `${user?.firstName} ${user?.lastName}`);
                const allReservations = reservationsRes.data;
                const myReservations = allReservations.filter(r => r.customerName === `${user?.firstName} ${user?.lastName}` || r.customerId === user?.id);

                setStats({
                    orders: allOrders.length,
                    payments: paymentsRes.data.length,
                    menuItems: menuRes.data.length,
                    tables: tablesRes.data.length,
                    myOrders: myOrders.length,
                    myReservations: myReservations.length
                });
                setRecentOrders(isCustomer ? myOrders.slice(0, 5) : allOrders.slice(0, 5));
            } catch (error) {
                console.log('Error fetching stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // admin/staff stat cards
    const adminStatCards = [
        { title: 'Total Orders', value: stats.orders, icon: FaShoppingCart, color: 'bg-blue-500', link: '/orders' },
        { title: 'Payments', value: stats.payments, icon: FaDollarSign, color: 'bg-green-500', link: '/payments' },
        { title: 'Menu Items', value: stats.menuItems, icon: FaBookOpen, color: 'bg-orange-500', link: '/menu' },
        { title: 'Tables', value: stats.tables, icon: FaCalendarAlt, color: 'bg-purple-500', link: '/tables' }
    ];

    // customer stat cards
    const customerStatCards = [
        { title: 'My Orders', value: stats.myOrders, icon: FaShoppingCart, color: 'bg-blue-500', link: '/orders' },
        { title: 'My Reservations', value: stats.myReservations, icon: FaCalendarAlt, color: 'bg-purple-500', link: '/tables' },
        { title: 'Menu Items', value: stats.menuItems, icon: FaBookOpen, color: 'bg-orange-500', link: '/browse-menu' },
    ];

    const adminActions = [
        { title: 'New Order', icon: FaShoppingCart, link: '/orders', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        { title: 'Add Menu Item', icon: FaBookOpen, link: '/menu', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        { title: 'New Reservation', icon: FaCalendarAlt, link: '/tables', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        { title: 'Process Payment', icon: FaDollarSign, link: '/payments', color: 'bg-green-50 text-green-600 hover:bg-green-100' }
    ];

    const customerActions = [
        { title: 'Browse Menu', icon: FaBookOpen, link: '/browse-menu', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
        { title: 'Make Reservation', icon: FaCalendarAlt, link: '/tables', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        { title: 'My Profile', icon: FaUser, link: '/profile', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
        { title: 'Order History', icon: FaHistory, link: '/profile', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' }
    ];

    const statCards = isCustomer ? customerStatCards : adminStatCards;
    const quickActions = isCustomer ? customerActions : adminActions;

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName || 'User'} 👋</h1>
                <p className="text-gray-500 text-sm mt-1">{isCustomer ? 'Here\'s your account overview' : 'Here\'s what\'s happening in your cafe today'}</p>
            </motion.div>

            <div className={`grid ${isCustomer ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'} gap-4 mb-8`}>
                {statCards.map((card, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Link to={card.link} className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                                    <card.icon className="text-white text-base" />
                                </div>
                                <FaChartLine className="text-green-500 text-sm" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2.5">
                        {quickActions.map((action, i) => (
                            <Link key={i} to={action.link} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl ${action.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                                <action.icon className="text-xl" />
                                <span className="text-[11px] font-medium text-center leading-tight">{action.title}</span>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900">{isCustomer ? 'My Recent Orders' : 'Recent Orders'}</h2>
                        <Link to={isCustomer ? '/profile' : '/orders'} className="text-amber-600 text-xs font-medium hover:text-amber-700 transition-colors flex items-center gap-1">
                            View All <FaArrowRight size={11} />
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-2.5">
                            {recentOrders.map((order, i) => (
                                <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                            <FaShoppingCart className="text-blue-600 text-xs" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900">{order.orderNumber}</p>
                                            <p className="text-[10px] text-gray-500">{order.customerName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-900">LKR {parseFloat(order.totalAmount).toFixed(2)}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                                <FaClock className="text-2xl" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-sm text-gray-500 mb-4">{isCustomer ? 'Your orders will appear here' : 'Start by creating your first order'}</p>
                            <Link to={isCustomer ? '/browse-menu' : '/orders'} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                <FaPlus size={14} /> {isCustomer ? 'Browse Menu' : 'New Order'}
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default Dashboard;
