const Booking = require("../models/Booking"); 
const transporter = require("../config/mail");

const createBooking = async (req, res) => {
    try {
        const result = await Booking.create(req.body); 
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            bookingId: result.insertedId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to create booking" });
    }
};

const sendBookingEmail = async (req, res) => {
    try {
        const { email, bookingDetails } = req.body;

        if (!email || !bookingDetails) {
            return res.status(400).json({ success: false, message: "Email and booking details are required" });
        }

        const mailOptions = {
            from: `"AuraAvenue Travel" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Booking Confirmation - Receipt #${bookingDetails.bookingId}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #10b981;">Booking Confirmed!</h2>
                    <p>Dear ${bookingDetails.travellerName},</p>
                    <p>Your trip for <b>${bookingDetails.packageTitle}</b> is confirmed.</p>
                    <hr />
                    <h3>Booking Details:</h3>
                    <ul>
                        <li><b>Booking ID:</b> ${bookingDetails.bookingId}</li>
                        <li><b>Travel Date:</b> ${bookingDetails.travelDate}</li>
                        <li><b>Travellers:</b> ${bookingDetails.travellers}</li>
                        <li><b>Room Type:</b> ${bookingDetails.roomType}</li>
                        <li><b>Total Amount Paid:</b> ₹${bookingDetails.totalAmount}</li>
                    </ul>
                    <p>We will contact you shortly with further instructions. Have a safe trip!</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Booking email sent successfully! Message ID:", info.messageId);

        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (err) {
        console.error("Send Booking Email Error:", err.message);
        res.status(500).json({ success: false, message: "Failed to send booking email" });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll();
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch bookings" });
    }
};

const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.json({ success: true, data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const result = await Booking.deleteById(req.params.id);
        if (!result.deletedCount) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        res.json({ success: true, message: "Booking deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBooking,
    sendBookingEmail 
};