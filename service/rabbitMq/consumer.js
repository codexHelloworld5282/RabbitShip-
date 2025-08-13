const { getChannel } = require('./connection');
const axios = require("axios");
const Tracking = require("../../models/tracking");
const courierService = require("../courier.service");

const courierAuth = {
    username: process.env.COURIER_USERNAME,
    password: process.env.COURIER_PASSWORD,
};

const axiosConfig = {
    auth: courierAuth,
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
};

// Common function to create a persistent consumer
async function createConsumer(exchange, queueName, handler) {
    const channel = getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });

    // Persistent queue (named, durable)
    await channel.assertQueue(queueName, { durable: true });

    // Bind the queue to the exchange
    channel.bindQueue(queueName, exchange, '');

    console.log(`👂 Waiting for messages in exchange "${exchange}", queue "${queueName}"`);

    channel.consume(queueName, async (msg) => {
        if (!msg?.content) return;

        let data;
        try {
            data = JSON.parse(msg.content.toString());
        } catch (err) {
            console.error("❌ Invalid message format:", err.message);
            channel.nack(msg, false, false); // reject and discard invalid message
            return;
        }

        try {
            await handler(data);
            channel.ack(msg); // ✅ Acknowledge only after processing
        } catch (err) {
            console.error(`❌ Error processing message from ${exchange}:`, err.message);
            channel.nack(msg, false, true); // requeue message for retry
        }
    }, { noAck: false }); // noAck=false → manual ack mode
}

/** BOOKING CONSUMER **/
async function bookingHandler(bookingData) {
    const orderId = bookingData?.orderId || (Array.isArray(bookingData) && bookingData[0]?.orderId);
    if (!orderId) throw new Error("Order ID missing");

    console.log(`📥 [BOOKING] Received for Order ID: ${orderId}`);

    const courierPayload = courierService.mapToCourierPayload(bookingData);

    const response = await axios.post(
        "https://bigazure.com/api/json_v3/shipment/create_shipment.php",
        courierPayload,
        axiosConfig
    );

    if (response.status === 200) {
        const trackingId = response.data?.cn || "";
        if (trackingId) {
            await Tracking.findOneAndUpdate(
                { orderId },
                { orderId, trackingId },
                { upsert: true, new: true }
            );
        }
        console.log(`✅ Shipment created for Order ID: ${orderId}, Tracking: ${trackingId}`);
    }
}

/** CANCEL CONSUMER **/
async function cancelHandler({ orderId }) {
    if (!orderId) throw new Error("Order ID is required");

    console.log(`📥 [CANCEL] Received for Order ID: ${orderId}`);

    const trackingDoc = await Tracking.findOne({ orderId });
    if (!trackingDoc) {
        console.warn(`⚠️ No tracking found for Order ID: ${orderId}`);
        return;
    }

    const cancelPayload = { consignment_no: trackingDoc.trackingId };
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/cancel/void.php",
        cancelPayload,
        axiosConfig
    );

    console.log("🚚 Cancel API response:", response.data);

    if (response.data.status === "1" || response.data.success === true) {
        await Tracking.deleteOne({ orderId });
        console.log(`✅ Shipment cancelled for Order ID: ${orderId}`);
    } else {
        console.warn(`❌ Failed to cancel Order ID: ${orderId}`, response.data);
    }
}

/** TRACKING CONSUMER **/
async function trackHandler({ orderId }) {
    if (!orderId) throw new Error("Order ID is required");

    console.log(`📥 [TRACK] Received for Order ID: ${orderId}`);

    const trackingDoc = await Tracking.findOne({ orderId });
    if (!trackingDoc) {
        console.warn(`⚠️ No tracking found for Order ID: ${orderId}`);
        return;
    }

    const trackPayload = { consignment_no: trackingDoc.trackingId };
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/tracking/get_tracking.php",
        trackPayload,
        axiosConfig
    );

    console.log("🚚 Tracking API response:", response.data);
}

/** STATUS CONSUMER **/
async function statusHandler({ orderId }) {
    if (!orderId) throw new Error("Order ID is required");

    console.log(`📥 [STATUS] Received for Order ID: ${orderId}`);

    const trackingDoc = await Tracking.findOne({ orderId });
    if (!trackingDoc) {
        console.warn(`⚠️ No tracking found for Order ID: ${orderId}`);
        return;
    }

    const statusPayload = { consignment_no: trackingDoc.trackingId };
    const response = await axios.post(
        "https://bigazure.com/api/json_v3/status/get_status.php",
        statusPayload,
        axiosConfig
    );

    console.log("📦 Status API response:", response.data);
}
module.exports = {
    startConsumer: (exchange) => createConsumer(exchange, "booking_queue", bookingHandler),
    startCancelConsumer: (exchange) => createConsumer(exchange, "cancel_queue", cancelHandler),
    startTrackConsumer: (exchange) => createConsumer(exchange, "track_queue", trackHandler),
    startStatusConsumer: (exchange) => createConsumer(exchange, "status_queue", statusHandler),
};
