// Order management routes - Gihen (IT24103788)
const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');
const { addOrderItem, getOrderItems, updateOrderItem, deleteOrderItem } = require('../controllers/orderItemController');
const { authMiddleware } = require('../../middleware/auth');

// order item routes - defined first to avoid /:id catching /items
router.post('/items', authMiddleware, addOrderItem);
router.get('/items/:orderId', authMiddleware, getOrderItems);
router.put('/items/:id', authMiddleware, updateOrderItem);
router.delete('/items/:id', authMiddleware, deleteOrderItem);

// order routes - full CRUD
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id', authMiddleware, updateOrder);
router.delete('/:id', authMiddleware, deleteOrder);

module.exports = router;
