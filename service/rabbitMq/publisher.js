const { getChannel } = require('./connection');

const publishBooking = async (exchange, bookingData) => {
    const channel = getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(bookingData)));
    console.log(`📤 Published booking to exchange "${exchange}"`);
};
const publishCancel = async (exchange, cancelData) => {
    const channel = getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(cancelData)));
    console.log(`📤 Published cancel request to exchange "${exchange}"`);
};

const publishTracking = async (exchange, trackData) => {
    const channel = getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(trackData)));
    console.log(`📤 Published tracking request to exchange "${exchange}"`);
};

const publishStatus = async (exchange, statusData) => {
    const channel = getChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: true });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(statusData)));
    console.log(`📤 Published status request to exchange "${exchange}"`);
};

module.exports = {
    publishBooking,
    publishCancel,
    publishTracking,
    publishStatus
};




