const express = require('express');
const app = express();
const bookingRoutes = require('./routes/booking.routes');
require("dotenv").config();
require('./db'); // MongoDB connection

// RabbitMQ imports
const { connectRabbitMQ } = require('./service/rabbitMq/connection');
const { startConsumer,startCancelConsumer,startTrackConsumer,startStatusConsumer } = require('./service/rabbitMq/consumer');


app.use(express.json());
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        // 1️⃣ Connect to RabbitMQ
        await connectRabbitMQ();

        // 2️⃣ Start consumer for booking messages
        await startConsumer("booking_exchange");

        // 3️⃣ Start consumer for cancel messages
        await startCancelConsumer("cancel_exchange");

        await startTrackConsumer("track_exchange");

        await startStatusConsumer("status_exchange")

        // 4️⃣ Start Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
})();
