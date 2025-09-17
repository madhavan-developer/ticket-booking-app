// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db.js");
const Stripe = require("stripe");
const Booking = require("./models/booking.js");
const { sendMailWithAttachment } = require("./utils/sendMail.js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// ✅ Connect DB
connectDB();

// ✅ Stripe webhook must use raw body parser BEFORE express.json()
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        const { userId, userEmail, show, bookedSeats } = session.metadata;

        // ✅ Create booking in DB (only after payment success)
        const newBooking = new Booking({
          userId,
          userEmail,
          show: JSON.parse(show),
          bookedSeats: JSON.parse(bookedSeats),
          isPaid: true,
        });

        await newBooking.save();
        console.log(`✅ Booking created: ${newBooking._id}`);

        // ✅ Send confirmation email with poster
        const seatList = newBooking.bookedSeats.join(", ");
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
                ${newBooking.show.movie?.title}
              </h3>
              <p><strong>Show Time:</strong> ${new Date(
                newBooking.show.showDateTime
              ).toLocaleString()}</p>
              <p><strong>Seats:</strong> ${seatList}</p>
              <p style="font-weight: bold; color: #2ecc71;">
                Total Price: ₹${newBooking.show.showPrice}
              </p>
            </div>
            <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #777;">
              Thank you for booking with <strong>MovieTime</strong> 🎬 <br/>
              Enjoy your movie!
            </div>
          </div>
        `;

        await sendMailWithAttachment(
          userEmail,
          "Booking Confirmation",
          html,
          newBooking.show.movie?.poster_path
        );

        console.log(`✅ Confirmation email sent to ${userEmail}`);
      } catch (err) {
        console.error("❌ Error creating booking or sending email:", err);
      }
    }

    res.json({ received: true });
  }
);

// ✅ After webhook, use normal middlewares
app.use(express.json());
app.use(cors());

// ✅ Serve uploaded files (e.g., posters, backdrops, certificates)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Hello World! Backend is running 🚀");
});

// ✅ Email test route (optional)
app.post("/api/send-email", async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    await sendMailWithAttachment(to, subject, html);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Email send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ API routes
const movieRoutes = require("./routes/movieRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const paymentRoutes = require("./routes/payment.js");

app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Dashboard stats route
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const bookings = await Booking.find();

    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => b.isPaid)
      .reduce((sum, b) => sum + (b.show?.showPrice || 0), 0);

    const totalUsers = new Set(bookings.map((b) => b.userId)).size;

    res.json({ totalBookings, totalRevenue, totalUsers });
  } catch (err) {
    console.error("Error in /api/dashboard/stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
