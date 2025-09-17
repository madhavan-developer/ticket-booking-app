// routes/bookingRoutes.js
const express = require("express");
const Booking = require("../models/booking.js");
const { sendMailWithAttachment } = require("../utils/sendMail.js");

const router = express.Router();

/**
 * 📌 GET /api/bookings?movieId=xxx&showtime=xxx
 * → Fetch bookings for a specific movie & showtime (used for seat layout)
 */
router.get("/", async (req, res) => {
  try {
    const { movieId, showtime } = req.query;

    // ✅ If no query params, return ALL bookings (for admin dashboard)
    if (!movieId || !showtime) {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      return res.json(bookings);
    }

    // ✅ Seat layout query
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
 * → Only show bookings that are Paid OR Canceled (hide unpaid drafts)
 */
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    const bookings = await Booking.find({
      userId: uid,
      $or: [{ isPaid: true }, { isCanceled: true }],
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error in GET /api/bookings/:uid:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 POST /api/bookings
 * → Create new booking (testing / non-Stripe flow)
 */
router.post("/", async (req, res) => {
  try {
    const { userId, userEmail, show, bookedSeats, isPaid } = req.body;

    if (!userId || !userEmail) {
      return res
        .status(400)
        .json({ error: "userId and userEmail are required" });
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

    const newBooking = new Booking({
      userId,
      userEmail,
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
    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Error in POST /api/bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 PATCH /api/bookings/:id
 * → Update booking and send email if paid
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { isPaid, isCanceled, cancelReason } = req.body;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (typeof isPaid === "boolean") booking.isPaid = isPaid;
    if (typeof isCanceled === "boolean") booking.isCanceled = isCanceled;
    if (typeof cancelReason === "string") booking.cancelReason = cancelReason;

    await booking.save();

    // ✅ Send confirmation mail if marked paid
    if (isPaid) {
      const seatList = booking.bookedSeats.join(", ");
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="background: #ff4d4f; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">🎉 Booking Confirmed 🎉</h2>
          </div>
          <div style="text-align: center; background: #f9f9f9; padding: 20px;">
            <img src="cid:posterImg" style="width: 200px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" alt="Movie Poster" />
          </div>
          <div style="padding: 20px; color: #333;">
            <h3 style="margin-bottom: 10px; font-size: 22px; color: #ff4d4f;">
              ${booking.show.movie?.title}
            </h3>
            <p><strong>Show Time:</strong> ${new Date(
              booking.show.showDateTime
            ).toLocaleString()}</p>
            <p><strong>Seats:</strong> ${seatList}</p>
            <p style="font-weight: bold; color: #2ecc71;">
              Total Price: ₹${booking.show.showPrice}
            </p>
          </div>
          <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #777;">
            Thank you for booking with <strong>MovieTime</strong> 🎬 <br/>
            Enjoy your movie!
          </div>
        </div>
      `;

      try {
        await sendMailWithAttachment(
          booking.userEmail,
          "Booking Confirmation",
          html,
          booking.show.movie?.poster_path
        );
        console.log(`✅ Confirmation email sent to ${booking.userEmail}`);
      } catch (mailErr) {
        console.error("❌ Failed to send booking email:", mailErr);
      }
    }

    res.json({ message: "Booking updated successfully", booking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * 📌 DELETE /api/bookings/:id
 */
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
