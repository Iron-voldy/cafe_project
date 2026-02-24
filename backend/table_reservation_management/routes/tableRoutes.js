// Table & Reservation routes - Peiris (IT24100953)
const express = require('express');
const router = express.Router();
const { createTable, getAllTables, getTableById, updateTable, deleteTable } = require('../controllers/tableController');
const { createReservation, getAllReservations, getReservationById, updateReservation, deleteReservation } = require('../controllers/reservationController');
const { authMiddleware } = require('../../middleware/auth');

// table routes - full CRUD
router.post('/tables', authMiddleware, createTable);
router.get('/tables', getAllTables);
router.get('/tables/:id', getTableById);
router.put('/tables/:id', authMiddleware, updateTable);
router.delete('/tables/:id', authMiddleware, deleteTable);

// reservation routes - full CRUD
router.post('/reservations', authMiddleware, createReservation);
router.get('/reservations', getAllReservations);
router.get('/reservations/:id', getReservationById);
router.put('/reservations/:id', authMiddleware, updateReservation);
router.delete('/reservations/:id', authMiddleware, deleteReservation);

module.exports = router;
