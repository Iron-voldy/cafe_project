// Billing & Payment routes - Bandara (IT24104140)
const express = require('express');
const router = express.Router();
const { createPayment, getAllPayments, getPaymentById, updatePayment, deletePayment } = require('../controllers/paymentController');
const { createInvoice, getAllInvoices, getInvoiceById, updateInvoice, deleteInvoice } = require('../controllers/invoiceController');
const { authMiddleware } = require('../../middleware/auth');

// invoice routes - defined first to avoid /:id catching /invoices
router.post('/invoices', authMiddleware, createInvoice);
router.get('/invoices', authMiddleware, getAllInvoices);
router.get('/invoices/:id', authMiddleware, getInvoiceById);
router.put('/invoices/:id', authMiddleware, updateInvoice);
router.delete('/invoices/:id', authMiddleware, deleteInvoice);

// payment routes - full CRUD
router.post('/', authMiddleware, createPayment);
router.get('/', authMiddleware, getAllPayments);
router.get('/:id', authMiddleware, getPaymentById);
router.put('/:id', authMiddleware, updatePayment);
router.delete('/:id', authMiddleware, deletePayment);

module.exports = router;
