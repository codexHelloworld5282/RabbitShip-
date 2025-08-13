const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    trackingId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Tracking', trackingSchema);
