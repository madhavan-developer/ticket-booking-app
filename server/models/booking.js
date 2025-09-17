// models/booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
    },
    show: {
      _id: { type: String, required: [true, "show._id is required"] }, // movie/show id
      movie: {
        title: { type: String, required: true },
        original_language: { type: String },
        runtime: { type: Number },
        poster_path: { type: String },
      },
      showDateTime: { type: Date, required: [true, "showDateTime is required"] },
      showPrice: { type: Number, required: [true, "showPrice is required"] },
    },
    bookedSeats: {
      type: [String],
      required: [true, "bookedSeats are required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one seat must be selected",
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isCanceled: {
      type: Boolean,
      default: false,
    },
    cancelReason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Optional: pre-save hook to update status automatically
BookingSchema.pre("save", function (next) {
  if (this.isCanceled) this.status = "canceled";
  else if (this.isPaid) this.status = "paid";
  else this.status = "pending";
  next();
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
