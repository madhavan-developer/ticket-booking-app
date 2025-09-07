require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db.js");
const Stripe = require("stripe");
const Booking = require("./models/booking.js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// Connect DB
connectDB();

// Stripe webhook must use raw body parser before express.json()
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Get bookingId from metadata
      const bookingId = session.metadata.bookingId;

      try {
        // Mark booking as paid in DB
        await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
        console.log(`Booking ${bookingId} marked as paid.`);
      } catch (err) {
        console.error("Error updating booking payment status:", err);
      }
    }

    res.json({ received: true });
  }
);

// After webhook, use normal middlewares
app.use(express.json());
app.use(cors());

// Serve uploaded files (e.g., posters)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/", (req, res) => {
  res.send("Hello World! Backend is running 🚀");
});

// API routes
const movieRoutes = require("./routes/movieRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const paymentRoutes = require("./routes/payment.js");

app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
