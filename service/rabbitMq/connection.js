const amqp = require('amqplib');

let channel, connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log("✅ RabbitMQ connected");
        return channel;
    } catch (err) {
        console.error("❌ RabbitMQ connection failed", err);
        process.exit(1);
    }
};

const getChannel = () => {
    if (!channel) throw new Error("RabbitMQ channel not initialized");
    return channel;
};

module.exports = { connectRabbitMQ, getChannel };
