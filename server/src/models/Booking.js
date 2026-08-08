const { ObjectId } = require("mongodb");
const { collectionBookings } = require("../config/db");

class Booking {
    // 1. Create a new booking
    static async create(bookingData) {
        const booking = {
            ...bookingData,
            bookingStatus: "Confirmed",
            createdAt: new Date()
        };
        return await collectionBookings.insertOne(booking);
    }

    // 2. Fetch all bookings
    static async findAll() {
        return await collectionBookings.find({}).sort({ createdAt: -1 }).toArray();
    }

    // 3. Fetch a single booking by ID
    static async findById(id) {
        return await collectionBookings.findOne({ _id: new ObjectId(id) });
    }

    // 4. Delete a booking by ID
    static async deleteById(id) {
        return await collectionBookings.deleteOne({ _id: new ObjectId(id) });
    }
}

module.exports = Booking;