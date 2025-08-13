const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const cancelController = require('../controllers/cancel.controller');
const trackController = require('../controllers/track.controller');
const getShipmentController = require('../controllers/getShipment.controller');

// Create booking route
router.post('/', bookingController.createBooking);
const axios = require("axios");

// Create booking route
// Use the controller method for creating shipment
router.post('/create-shipment', bookingController.createShipment);
router.post('/cancel-shipment', cancelController.cancelShipment);
router.post('/track-shipment', trackController.trackShipment); // or create a new controller file
router.post('/get-status', getShipmentController.getShipmentStatus);
module.exports = router;
