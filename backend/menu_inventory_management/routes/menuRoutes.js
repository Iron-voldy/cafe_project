// Menu & Inventory routes - Kasfbi (IT24102666)
const express = require('express');
const router = express.Router();
const { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem } = require('../controllers/menuItemController');
const { createStock, getAllStock, getStockById, updateStock, deleteStock, getLowStockAlerts } = require('../controllers/stockController');
const { authMiddleware } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// menu item routes - full CRUD
router.post('/items', authMiddleware, upload.single('image'), createMenuItem);
router.get('/items', getAllMenuItems);
router.get('/items/:id', getMenuItemById);
router.put('/items/:id', authMiddleware, upload.single('image'), updateMenuItem);
router.delete('/items/:id', authMiddleware, deleteMenuItem);

// stock routes - full CRUD
router.post('/stock', authMiddleware, createStock);
router.get('/stock', authMiddleware, getAllStock);
router.get('/stock/alerts', authMiddleware, getLowStockAlerts);
router.get('/stock/:id', authMiddleware, getStockById);
router.put('/stock/:id', authMiddleware, updateStock);
router.delete('/stock/:id', authMiddleware, deleteStock);

module.exports = router;
