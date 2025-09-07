const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  show: {
    _id: { type: String, required: true }, // movie/show id
    movie: {
      title: String,
      original_language: String,
      runtime: Number,
      poster_path: String,
    },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
  },
  bookedSeats: {
    type: [String],
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
