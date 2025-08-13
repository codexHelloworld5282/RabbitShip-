const axios = require("axios");
const Tracking = require("../models/tracking");

exports.getShipmentStatus = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // Find trackingId (Consignment No) by orderId in DB
        const trackingDoc = await Tracking.findOne({ orderId });
        if (!trackingDoc) {
            return res.status(404).json({ message: "Tracking ID not found for this order" });
        }

        const consignment_no = trackingDoc.trackingId; // API expects this key
        console.log(`Getting shipment status for orderId: ${orderId}, Consignment No: ${consignment_no}`);

        // Prepare payload for courier API
        const statusPayload = { consignment_no };

        // Call courier API status endpoint
        const response = await axios.post(
            "https://bigazure.com/api/json_v3/status/get_status.php",
            statusPayload,
            {
                auth: {
                    username: process.env.COURIER_USERNAME,
                    password: process.env.COURIER_PASSWORD,
                },
                headers: { "Content-Type": "application/json" },
                timeout: 15000, // 15 seconds timeout
            }
        );

        console.log("Courier get status response:", response.data);

        // Check API response success
        if (response.data.status === "1" || response.data.success === true) {
            return res.status(200).json({
                message: "Shipment status fetched successfully",
                courierResponse: response.data,
            });
        } else {
            return res.status(400).json({
                message: "Failed to fetch shipment status",
                courierResponse: response.data,
            });
        }

    } catch (error) {
        console.error("Error fetching shipment status:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data || "Internal server error while fetching shipment status",
        });
    }
};
