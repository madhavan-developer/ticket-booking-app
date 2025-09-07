const express = require("express");
const Stripe = require("stripe");
const Booking = require("../models/booking.js");

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Exists" : "Missing");
    console.log("CLIENT_URL:", process.env.CLIENT_URL);

    const { booking } = req.body;
    console.log("Received booking data:", booking);

    if (!booking || !booking.show || !booking.show.movie || !booking.show.showPrice || !booking.bookedSeats) {
      console.error("Invalid booking data:", booking);
      return res.status(400).json({ error: "Invalid booking data." });
    }

    const price = Number(booking.show.showPrice);
    if (isNaN(price)) {
      console.error("Invalid price:", booking.show.showPrice);
      return res.status(400).json({ error: "Invalid show price." });
    }

    const newBooking = new Booking({
      userId: booking.userId,
      show: booking.show,
      bookedSeats: booking.bookedSeats,
      isPaid: false,
    });

    try {
      await newBooking.save();
    } catch (dbErr) {
      console.error("Booking save failed:", dbErr);
      return res.status(500).json({ error: "Failed to save booking" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: booking.show.movie.title || "Movie Ticket",
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/mybookings?success=true&bookingId=${newBooking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/mybookings?canceled=true`,
    });

    console.log("Stripe session created:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
