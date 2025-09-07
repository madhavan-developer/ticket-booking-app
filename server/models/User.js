const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  show: {
    _id: String,
    movie: Object,
    showDateTime: String,
    showPrice: Number,
  },
  bookedSeats: [String],
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });
