// Order management routes - Gihen (IT24103788)
const express = require('express');
const router = express.Router();
const { validateOrder, createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');
const { addOrderItem, getOrderItems, updateOrderItem, deleteOrderItem } = require('../controllers/orderItemController');
const { authMiddleware, optionalAuth } = require('../../middleware/auth');

// order item routes
router.post('/items', authMiddleware, addOrderItem);
router.get('/items/:orderId', authMiddleware, getOrderItems);
router.put('/items/:id', authMiddleware, updateOrderItem);
router.delete('/items/:id', authMiddleware, deleteOrderItem);

// order routes - full CRUD
router.post('/', optionalAuth, validateOrder, createOrder);
router.get('/', authMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id', authMiddleware, updateOrder);
router.delete('/:id', authMiddleware, deleteOrder);

module.exports = router;
