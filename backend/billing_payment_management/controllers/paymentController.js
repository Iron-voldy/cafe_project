// Payment controller - Bandara (IT24104140) - CRUD operations for payments
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// generate unique payment number
const generatePaymentNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PAY-${timestamp}-${random}`;
};

// create a new payment
const createPayment = async (req, res) => {
    try {
        const { orderId, amount, tax, discount, paymentMethod, paidBy } = req.body;
        // calculate total amount
        const taxAmount = tax || 0;
        const discountAmount = discount || 0;
        const totalAmount = parseFloat(amount) + parseFloat(taxAmount) - parseFloat(discountAmount);
        // generate payment number
        const paymentNumber = generatePaymentNumber();
        // create payment record
        const payment = await Payment.create({
            paymentNumber, orderId, amount, tax: taxAmount, discount: discountAmount,
            totalAmount, paymentMethod, paidBy
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
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
};

// update payment
const updatePayment = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        const { amount, tax, discount, paymentMethod, paymentStatus, paidBy } = req.body;
        // recalculate total if amounts changed
        const newAmount = amount || payment.amount;
        const newTax = tax !== undefined ? tax : payment.tax;
        const newDiscount = discount !== undefined ? discount : payment.discount;
        const totalAmount = parseFloat(newAmount) + parseFloat(newTax) - parseFloat(newDiscount);
        // update payment
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
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        // delete associated invoices
        await Invoice.destroy({ where: { paymentId: payment.id } });
        await payment.destroy();
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment', error: error.message });
    }
};

module.exports = { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment };
