// Payment controller - Bandara (IT24104140) - CRUD operations for payments
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Order = require('../../order_management/models/Order');

// validation rules
const validatePayment = [
    body('orderId').notEmpty().withMessage('Order ID is required').isInt({ min: 1 }).withMessage('Order ID must be a positive integer'),
    body('amount').notEmpty().withMessage('Amount is required').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod').isIn(['cash', 'card', 'online']).withMessage('Invalid payment method'),
];

// generate unique payment number
const generatePaymentNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PAY-${timestamp}-${random}`;
};

// get payment by order id — for auto-populating payment form
const getPaymentByOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ orderId: order.id, orderNumber: order.orderNumber, customerName: order.customerName, totalAmount: order.totalAmount });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

// create a new payment
const createPayment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    try {
        const { orderId, amount, tax, discount, paymentMethod, paymentStatus, paidBy } = req.body;
        const taxAmount = parseFloat(tax || 0);
        const discountAmount = parseFloat(discount || 0);
        const totalAmount = parseFloat(amount) + taxAmount - discountAmount;
        const paymentNumber = generatePaymentNumber();
        const payment = await Payment.create({
            paymentNumber, orderId, amount, tax: taxAmount, discount: discountAmount,
            totalAmount, paymentMethod,
            paymentStatus: paymentStatus || 'pending',
            paidBy: paidBy || null
        });
        res.status(201).json({ message: 'Payment created successfully', payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create payment', error: error.message });
    }
};

// get all payments
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{ model: Invoice, as: 'invoices' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
};

// get single payment by id
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, { include: [{ model: Invoice, as: 'invoices' }] });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
};

// update payment
const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        const { amount, tax, discount, paymentMethod, paymentStatus, paidBy } = req.body;
        const newAmount = amount !== undefined ? parseFloat(amount) : parseFloat(payment.amount);
        const newTax = tax !== undefined ? parseFloat(tax) : parseFloat(payment.tax);
        const newDiscount = discount !== undefined ? parseFloat(discount) : parseFloat(payment.discount);
        const totalAmount = newAmount + newTax - newDiscount;
        await payment.update({ amount: newAmount, tax: newTax, discount: newDiscount, totalAmount, paymentMethod, paymentStatus, paidBy });
        res.json({ message: 'Payment updated successfully', payment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment', error: error.message });
    }
};

// delete payment
const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        await Invoice.destroy({ where: { paymentId: payment.id } });
        await payment.destroy();
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment', error: error.message });
    }
};

module.exports = { validatePayment, createPayment, getAllPayments, getPaymentById, getPaymentByOrder, updatePayment, deletePayment };

