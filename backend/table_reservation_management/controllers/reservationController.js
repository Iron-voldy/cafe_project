// Reservation controller - Peiris (IT24100953) - CRUD operations for reservations
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// generate unique reservation number
const generateReservationNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `RES-${timestamp}-${random}`;
};

// create a new reservation
const createReservation = async (req, res) => {
    try {
        const { tableId, customerName, customerPhone, customerEmail, partySize, reservationDate, reservationTime, duration, specialRequests } = req.body;
        // check if table exists
        const table = await Table.findByPk(tableId);
        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        // check if party size fits table capacity
        if (partySize > table.seatingCapacity) {
            return res.status(400).json({ message: `Party size exceeds table capacity of ${table.seatingCapacity}` });
        }
        // generate reservation number
        const reservationNumber = generateReservationNumber();
        // create reservation
        const reservation = await Reservation.create({
            reservationNumber, tableId, customerName, customerPhone, customerEmail,
            partySize, reservationDate, reservationTime, duration, specialRequests
        });
        // update table status to reserved
        await table.update({ status: 'reserved' });
        // return with table info
        const fullReservation = await Reservation.findByPk(reservation.id, { include: [{ model: Table, as: 'table' }] });
        res.status(201).json({ message: 'Reservation created successfully', reservation: fullReservation });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create reservation', error: error.message });
    }
};

// get all reservations
const getAllReservations = async (req, res) => {
    try {
        // support status and date filter
        const whereClause = {};
        if (req.query.status) whereClause.status = req.query.status;
        if (req.query.date) whereClause.reservationDate = req.query.date;
        const reservations = await Reservation.findAll({
            where: whereClause,
            include: [{ model: Table, as: 'table' }],
            order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reservations', error: error.message });
    }
};

// get single reservation by id
const getReservationById = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, { include: [{ model: Table, as: 'table' }] });
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch reservation', error: error.message });
    }
};

// update reservation
const updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        const { tableId, customerName, customerPhone, customerEmail, partySize, reservationDate, reservationTime, duration, status, specialRequests } = req.body;
        // if status is cancelled or completed, free the table
        if (status === 'cancelled' || status === 'completed') {
            await Table.update({ status: 'available' }, { where: { id: reservation.tableId } });
        }
        // update reservation
        await reservation.update({ tableId, customerName, customerPhone, customerEmail, partySize, reservationDate, reservationTime, duration, status, specialRequests });
        const updated = await Reservation.findByPk(reservation.id, { include: [{ model: Table, as: 'table' }] });
        res.json({ message: 'Reservation updated successfully', reservation: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update reservation', error: error.message });
    }
};

// delete reservation
const deleteReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        // free the table
        await Table.update({ status: 'available' }, { where: { id: reservation.tableId } });
        await reservation.destroy();
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete reservation', error: error.message });
    }
};

module.exports = { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation };
