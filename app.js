const express = require("express");
const bodyParser = require("body-parser");
const bookingRoutes = require("./routes/booking.routes");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use("/api/bookings", bookingRoutes);

module.exports = app;
