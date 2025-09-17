// routes/bookingRoutes.js
const express = require("express");
const Booking = require("../models/booking.js");
const { sendMail } = require("../utils/sendMail.js");

const router = express.Router();

/**
 * 📌 GET /api/bookings?movieId=xxx&showtime=xxx
 * → Fetch all bookings for a specific movie & showtime (used for seat layout)
 */
router.get("/", async (req, res) => {
  try {
    const { movieId, showtime } = req.query;

    if (!movieId || !showtime) {
      return res.status(400).json({
        error: "movieId and showtime are required as query params",
      });
    }

    const bookings = await Booking.find({
      "show._id": movieId,
      "show.showDateTime": new Date(showtime),
    });

    res.json(bookings);
  } catch (err) {
    console.error("Error in GET /api/bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 GET /api/bookings/:uid
 * → Fetch all bookings for a specific user
 */
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const bookings = await Booking.find({ userId: uid }).sort({
      createdAt: -1,
    });
    res.json(bookings);
  } catch (err) {
    console.error("Error in GET /api/bookings/:uid:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 POST /api/bookings
 * → Create a new booking (used for testing or non-Stripe bookings)
 */
router.post("/", async (req, res) => {
  try {
    const { userId, show, bookedSeats, isPaid } = req.body;

    // ---- Validation ----
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!show || typeof show !== "object") {
      return res.status(400).json({ error: "show object is required" });
    }

    const { _id, showDateTime, showPrice, movie } = show;

    if (!_id || !showDateTime || !showPrice) {
      return res.status(400).json({
        error: "show._id, show.showDateTime and show.showPrice are required",
      });
    }

    if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one seat must be provided" });
    }

    // ---- Create & save booking ----
    const newBooking = new Booking({
      userId,
      show: {
        _id,
        movie: movie || {},
        showDateTime,
        showPrice,
      },
      bookedSeats,
      isPaid: Boolean(isPaid),
    });

    await newBooking.save();

    // ✉️ Only send mail if booking is already paid
    if (newBooking.isPaid) {
      try {
        const seatList = bookedSeats.join(", ");
        const html = `
          <h2>Your Booking is Confirmed 🎉</h2>
          <p><strong>Movie:</strong> ${movie?.title || "N/A"}</p>
          <p><strong>Show Time:</strong> ${new Date(
            showDateTime
          ).toLocaleString()}</p>
          <p><strong>Seats:</strong> ${seatList}</p>
          <p>Total Price: ₹${showPrice}</p>
        `;
        await sendMail(
          user.email, // assumes userId is an email
          "Booking Confirmation",
          html
        );
      } catch (mailErr) {
        console.error("Failed to send booking email:", mailErr);
      }
    }

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error in POST /api/bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📌 PATCH /api/bookings/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { isPaid, isCanceled, cancelReason } = req.body;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Only update fields that are provided
    if (typeof isPaid === "boolean") booking.isPaid = isPaid;
    if (typeof isCanceled === "boolean") booking.isCanceled = isCanceled;
    if (typeof cancelReason === "string") booking.cancelReason = cancelReason;

    // ✅ Pre-save hook will handle status
    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📌 DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error in DELETE /api/bookings/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
