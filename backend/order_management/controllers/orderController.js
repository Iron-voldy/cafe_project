// Order controller - Gihen (IT24103788) - CRUD operations for orders
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

// create a new order
const createOrder = async (req, res) => {
    try {
        const { customerName, orderType, tableNumber, notes, items } = req.body;
        // generate unique order number
        const orderNumber = generateOrderNumber();
        // calculate total from items
        let totalAmount = 0;
        if (items && items.length > 0) {
            totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        }
        // create the order
        const order = await Order.create({
            orderNumber,
            customerId: req.user?.id || null,
            customerName,
            orderType,
            tableNumber,
            totalAmount,
            notes
        });
        // create order items if provided
        if (items && items.length > 0) {
            const orderItems = items.map(item => ({
                orderId: order.id,
                itemName: item.itemName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                specialInstructions: item.specialInstructions || null
            }));
            await OrderItem.bulkCreate(orderItems);
        }
        // fetch complete order with items
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

module.exports = { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };
