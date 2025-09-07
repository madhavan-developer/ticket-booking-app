const express = require("express");
const Booking = require("../models/booking.js");

const router = express.Router();

/**
 * 📌 GET /api/bookings?movieId=xxx&showtime=xxx
 * Fetch bookings by movie and showtime (used for showing seat layout)
 */
router.get("/", async (req, res) => {
  try {
    const { movieId, showtime } = req.query;

    if (!movieId || !showtime) {
      return res.status(400).json({ error: "movieId and showtime are required" });
    }

    const bookings = await Booking.find({
      "show._id": movieId,
      "show.showDateTime": showtime,
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error in GET /api/bookings (seat layout):", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 GET /api/bookings/:uid
 * Fetch bookings by user ID (used in MyBookings page)
 */
router.get("/:uid", async (req, res) => {
  try {
    const userId = req.params.uid;

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error in GET /api/bookings/:uid:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 POST /api/bookings
 * Create a new booking (used internally or for testing only)
 */
router.post("/", async (req, res) => {
  try {
    const { userId, show, bookedSeats, isPaid } = req.body;

    if (!userId || !show || !bookedSeats || !bookedSeats.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking = new Booking({
      userId,
      show,
      bookedSeats,
      isPaid: isPaid || false,
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error in POST /api/bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 PATCH /api/bookings/:id
 * Update an existing booking (used to mark isPaid = true after successful payment)
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (err) {
    console.error("Error in PATCH /api/bookings/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
