// Invoice controller - Bandara (IT24104140) - CRUD operations for invoices
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

// generate unique invoice number
const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `INV-${timestamp}-${random}`;
};

// create a new invoice
const createInvoice = async (req, res) => {
    try {
        const { paymentId, customerName, customerEmail, subtotal, tax, discount } = req.body;
        // verify payment exists
        const payment = await Payment.findByPk(paymentId);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        // calculate grand total
        const grandTotal = parseFloat(subtotal) + parseFloat(tax || 0) - parseFloat(discount || 0);
        const invoiceNumber = generateInvoiceNumber();
        // create invoice
        const invoice = await Invoice.create({
            invoiceNumber, paymentId, customerName, customerEmail,
            subtotal, tax: tax || 0, discount: discount || 0, grandTotal
        });
        res.status(201).json({ message: 'Invoice created successfully', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create invoice', error: error.message });
    }
};

// get all invoices
const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [{ model: Payment, as: 'payment' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch invoices', error: error.message });
    }
};

// get single invoice by id
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id, { include: [{ model: Payment, as: 'payment' }] });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch invoice', error: error.message });
    }
};

// update invoice
const updateInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        const { customerName, customerEmail, subtotal, tax, discount, status } = req.body;
        // recalculate grand total if amounts changed
        const newSubtotal = subtotal || invoice.subtotal;
        const newTax = tax !== undefined ? tax : invoice.tax;
        const newDiscount = discount !== undefined ? discount : invoice.discount;
        const grandTotal = parseFloat(newSubtotal) + parseFloat(newTax) - parseFloat(newDiscount);
        // update invoice
        await invoice.update({ customerName, customerEmail, subtotal: newSubtotal, tax: newTax, discount: newDiscount, grandTotal, status });
        res.json({ message: 'Invoice updated successfully', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update invoice', error: error.message });
    }
};

// delete invoice
const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        await invoice.destroy();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete invoice', error: error.message });
    }
};

module.exports = { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice };
