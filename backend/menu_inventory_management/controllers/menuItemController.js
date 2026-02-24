// MenuItem controller - Kasfbi (IT24102666) - CRUD operations for menu items
const MenuItem = require('../models/MenuItem');

// create a new menu item
const createMenuItem = async (req, res) => {
    try {
        const { name, description, category, price, isAvailable, preparationTime } = req.body;
        const image = req.file ? `/uploads/menu/${req.file.filename}` : (req.body.image || null);
        // check if item name already exists
        const existing = await MenuItem.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: 'Menu item with this name already exists' });
        }
        // create menu item
        const menuItem = await MenuItem.create({ name, description, category, price, image, isAvailable, preparationTime });
        res.status(201).json({ message: 'Menu item created successfully', menuItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create menu item', error: error.message });
    }
};

// get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        // support category filter via query param
        const whereClause = {};
        if (req.query.category) {
            whereClause.category = req.query.category;
        }
        if (req.query.available) {
            whereClause.isAvailable = req.query.available === 'true';
        }
        const menuItems = await MenuItem.findAll({ where: whereClause, order: [['category', 'ASC'], ['name', 'ASC']] });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
    }
};

// get single menu item by id
const getMenuItemById = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByPk(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch menu item', error: error.message });
    }
};

// update menu item
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByPk(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        const { name, description, category, price, isAvailable, preparationTime } = req.body;
        const image = req.file ? `/uploads/menu/${req.file.filename}` : (req.body.image || menuItem.image);
        // update menu item
        await menuItem.update({ name, description, category, price, image, isAvailable, preparationTime });
        res.json({ message: 'Menu item updated successfully', menuItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update menu item', error: error.message });
    }
};

// delete menu item
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByPk(req.params.id);
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        await menuItem.destroy();
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
    }
};

module.exports = { createMenuItem, getAllMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem };
