const courierService = require("../service/courier.service");
const Tracking = require('../models/tracking');
const axios = require("axios");

// Create Courier Payload from Booking Data
exports.createBooking = (req, res) => {
    try {
        const bookingData = req.body;

        // Build courier payload
        const courierPayload = courierService.mapToCourierPayload(bookingData);

        res.status(200).json({
            message: "Courier payload created successfully",
            courierPayload
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { publishBooking } = require('../service/rabbitMq/publisher');

exports.createShipment = async (req, res) => {
    try {
        const bookingData = req.body;
        await publishBooking("booking_exchange", bookingData);

        res.status(200).json({
            message: "Booking published to queue successfully"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
