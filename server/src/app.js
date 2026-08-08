// Sabse pehle env variables load hone chahiye!
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const destinationRoutes = require("./routes/destinationRoutes");
const packageRoutes = require("./routes/packageRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Explicitly allow PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
// app.use("/api/auth", authRoutes);//means at fatching /api/auth/send-otp
app.use("/auth",authRoutes);
app.use("/admin",adminRoutes);
app.use("/notifications", require("./routes/notificationRoutes"));

module.exports = app;