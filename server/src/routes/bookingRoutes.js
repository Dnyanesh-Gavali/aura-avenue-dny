const express = require("express");
const router = express.Router();

const {
    createBooking,
    getAllBookings,
    getBookingById,
    deleteBooking,
    sendBookingEmail
} = require("../controllers/bookingController");

router.post("/", createBooking);
router.get("/", getAllBookings);
router.post("/send-email",sendBookingEmail);
router.get("/:id", getBookingById);
router.delete("/:id", deleteBooking);


module.exports = router;