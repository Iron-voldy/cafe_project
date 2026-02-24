// Table controller - Peiris (IT24100953) - CRUD operations for cafe tables
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

// create a new table
const createTable = async (req, res) => {
    try {
        const { tableNumber, seatingCapacity, location, description } = req.body;
        // check if table number already exists
        const existing = await Table.findOne({ where: { tableNumber } });
        if (existing) {
            return res.status(400).json({ message: 'Table with this number already exists' });
        }
        // create table
        const table = await Table.create({ tableNumber, seatingCapacity, location, description });
        res.status(201).json({ message: 'Table created successfully', table });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create table', error: error.message });
    }
};

// get all tables
const getAllTables = async (req, res) => {
    try {
        // support status and location filter
        const whereClause = {};
        if (req.query.status) whereClause.status = req.query.status;
        if (req.query.location) whereClause.location = req.query.location;
        const tables = await Table.findAll({
            where: whereClause,
            include: [{ model: Reservation, as: 'reservations' }],
            order: [['tableNumber', 'ASC']]
        });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
    }
};

// get single table by id
const getTableById = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id, { include: [{ model: Reservation, as: 'reservations' }] });
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch table', error: error.message });
    }
};

// update table
const updateTable = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        const { tableNumber, seatingCapacity, location, status, description } = req.body;
        // update table
        await table.update({ tableNumber, seatingCapacity, location, status, description });
        res.json({ message: 'Table updated successfully', table });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update table', error: error.message });
    }
};

// delete table
const deleteTable = async (req, res) => {
    try {
        const table = await Table.findByPk(req.params.id);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        // delete associated reservations
        await Reservation.destroy({ where: { tableId: table.id } });
        await table.destroy();
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete table', error: error.message });
    }
};

module.exports = { createTable, getAllTables, getTableById, updateTable, deleteTable };
