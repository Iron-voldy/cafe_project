// Order controller - Gihen (IT24103788) - CRUD operations for orders
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const MenuItem = require('../../menu_inventory_management/models/MenuItem');

// validation rules for create order
const validateOrder = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('orderType').isIn(['dine-in', 'takeaway', 'online']).withMessage('Invalid order type'),
    body('tableNumber').optional().isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
    body('items').optional().isArray().withMessage('Items must be an array'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
];

// generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// create a new order
const createOrder = async (req, res) => {
    // run express-validator checks
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    try {
        const { customerName, orderType, tableNumber, notes, items } = req.body;
        const orderNumber = generateOrderNumber();
        // resolve each item — if menuItemId provided, fetch name + price from DB
        let resolvedItems = [];
        if (items && items.length > 0) {
            for (const item of items) {
                let resolvedName = item.itemName;
                let resolvedPrice = parseFloat(item.unitPrice);
                if (item.menuItemId) {
                    const menuItem = await MenuItem.findByPk(item.menuItemId);
                    if (!menuItem) return res.status(404).json({ message: `Menu item not found: ID ${item.menuItemId}` });
                    resolvedName = menuItem.name;
                    resolvedPrice = parseFloat(menuItem.price);
                }
                resolvedItems.push({ menuItemId: item.menuItemId || null, itemName: resolvedName, quantity: parseInt(item.quantity), unitPrice: resolvedPrice, totalPrice: parseInt(item.quantity) * resolvedPrice, specialInstructions: item.specialInstructions || null });
            }
        }
        const totalAmount = resolvedItems.reduce((s, i) => s + i.totalPrice, 0);
        const order = await Order.create({
            orderNumber, customerId: req.user?.id || null, customerName,
            orderType, tableNumber: orderType === 'dine-in' ? (tableNumber || null) : null,
            totalAmount, notes
        });
        if (resolvedItems.length > 0) {
            await OrderItem.bulkCreate(resolvedItems.map(i => ({ ...i, orderId: order.id })));
        }
        const completeOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
        res.status(201).json({ message: 'Order created successfully', order: completeOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

// get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

// get single order by id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }] });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

// update order
const updateOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const { customerName, orderType, status, tableNumber, notes } = req.body;
        // update order fields
        await order.update({ customerName, orderType, status, tableNumber, notes });
        const updatedOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
        res.json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
};

// delete order
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // delete associated order items first
        await OrderItem.destroy({ where: { orderId: order.id } });
        await order.destroy();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
};

module.exports = { validateOrder, createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
