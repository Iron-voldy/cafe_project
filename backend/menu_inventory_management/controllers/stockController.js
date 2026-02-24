// Stock controller - Kasfbi (IT24102666) - CRUD operations for inventory stock
const Stock = require('../models/Stock');
const { Op } = require('sequelize');

// create a new stock item
const createStock = async (req, res) => {
    try {
        const { ingredientName, category, quantity, unit, minimumStock, unitPrice, supplier, expiryDate } = req.body;
        // determine stock status based on quantity
        let status = 'in_stock';
        if (quantity <= 0) status = 'out_of_stock';
        else if (quantity <= (minimumStock || 10)) status = 'low_stock';
        // create stock item
        const stock = await Stock.create({ ingredientName, category, quantity, unit, minimumStock, unitPrice, supplier, expiryDate, status });
        res.status(201).json({ message: 'Stock item created successfully', stock });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create stock item', error: error.message });
    }
};

// get all stock items
const getAllStock = async (req, res) => {
    try {
        // support status filter
        const whereClause = {};
        if (req.query.status) {
            whereClause.status = req.query.status;
        }
        if (req.query.category) {
            whereClause.category = req.query.category;
        }
        const stocks = await Stock.findAll({ where: whereClause, order: [['ingredientName', 'ASC']] });
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stock items', error: error.message });
    }
};

// get single stock item by id
const getStockById = async (req, res) => {
    try {
        const stock = await Stock.findByPk(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        res.json(stock);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stock item', error: error.message });
    }
};

// update stock item
const updateStock = async (req, res) => {
    try {
        const stock = await Stock.findByPk(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        const { ingredientName, category, quantity, unit, minimumStock, unitPrice, supplier, expiryDate } = req.body;
        // recalculate status
        const newQuantity = quantity !== undefined ? quantity : stock.quantity;
        const newMinimumStock = minimumStock !== undefined ? minimumStock : stock.minimumStock;
        let status = 'in_stock';
        if (newQuantity <= 0) status = 'out_of_stock';
        else if (newQuantity <= newMinimumStock) status = 'low_stock';
        // update stock item
        await stock.update({ ingredientName, category, quantity: newQuantity, unit, minimumStock: newMinimumStock, unitPrice, supplier, expiryDate, status });
        res.json({ message: 'Stock item updated successfully', stock });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update stock item', error: error.message });
    }
};

// delete stock item
const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByPk(req.params.id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found' });
        }
        await stock.destroy();
        res.json({ message: 'Stock item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete stock item', error: error.message });
    }
};

// get low stock alerts
const getLowStockAlerts = async (req, res) => {
    try {
        const lowStock = await Stock.findAll({
            where: { status: { [Op.in]: ['low_stock', 'out_of_stock'] } },
            order: [['quantity', 'ASC']]
        });
        res.json(lowStock);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch low stock alerts', error: error.message });
    }
};

module.exports = { createStock, getAllStock, getStockById, updateStock, deleteStock, getLowStockAlerts };
