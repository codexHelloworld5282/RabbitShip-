const { publishCancel } = require('../service/rabbitMq/publisher');

exports.cancelShipment = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        await publishCancel("cancel_exchange", { orderId });

        res.status(200).json({
            message: "Cancel request published successfully",
            orderId
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
