// main app component with routing - cafe management system
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/user_management/Login';
import AdminLogin from './components/user_management/AdminLogin';
import Register from './components/user_management/Register';
import OrderManagement from './components/order_management/OrderManagement';
import BillingPaymentManagement from './components/billing_payment_management/BillingPaymentManagement';
import MenuInventoryManagement from './components/menu_inventory_management/MenuInventoryManagement';
import TableReservationManagement from './components/table_reservation_management/TableReservationManagement';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1F2937', color: '#F9FAFB' } }} />
                <Routes>
                    {/* public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/register" element={<Register />} />

                    {/* protected routes - require authentication */}
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Layout><OrderManagement /></Layout></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Layout><BillingPaymentManagement /></Layout></ProtectedRoute>} />
                    <Route path="/menu" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Layout><MenuInventoryManagement /></Layout></ProtectedRoute>} />
                    <Route path="/tables" element={<ProtectedRoute><Layout><TableReservationManagement /></Layout></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
