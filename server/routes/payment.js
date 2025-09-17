// routes/payment.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Booking = require("../models/booking.js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Received booking data:", req.body.booking);

    const { booking } = req.body;
    if (!booking) return res.status(400).json({ error: "booking is required" });

    const { userId, userEmail, show, bookedSeats = [], isPaid } = booking;

    if (!userId || !userEmail) {
      return res.status(400).json({ error: "userId and userEmail are required" });
    }

    // ✅ Create a draft booking (unpaid until webhook confirms)
    const newBooking = new Booking({
      userId,
      userEmail,
      show,
      bookedSeats,
      isPaid: Boolean(isPaid),
    });

    await newBooking.save();

    // --- Pricing ---
    const seatsCount =
      Array.isArray(bookedSeats) && bookedSeats.length > 0 ? bookedSeats.length : 1;

    const perSeatPrice = Math.round((Number(show?.showPrice) / seatsCount) * 100);

    // ✅ Create Stripe session (metadata kept minimal)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: show.movie?.title || "Movie Booking",
            },
            unit_amount: perSeatPrice,
          },
          quantity: seatsCount,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/mybookings?success=true&bookingId=${newBooking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/mybookings?canceled=true`,
      metadata: {
        bookingId: newBooking._id.toString(),
        userId, // ✅ safe short strings
        seatCount: seatsCount.toString(),
      },
    });

    console.log("Stripe pricing:", {
      seatsCount,
      perSeatPrice,
      total: (perSeatPrice * seatsCount) / 100,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Booking save failed:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;
