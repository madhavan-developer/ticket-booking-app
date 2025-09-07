const mongoose = require("mongoose");

const seatGroupSchema = new mongoose.Schema({
  layout: {
    type: String,
    enum: ["stacked", "grid"],
    required: true,
  },
  rows: [{ type: String, required: true }], // ["A", "B", "C"]
  price: { type: Number, required: true }, // price for this group
});

const seatLayoutSchema = new mongoose.Schema({
  seatsPerRow: { type: Number, required: true },
  groupings: [seatGroupSchema],
});

const showSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    overview: { type: String, required: true },
    genres: { type: [String], required: true },
    release_date: { type: String, required: true }, // stored as dd/MM/yyyy
    tagline: { type: String },
    showtimes: [{ type: Date }], // multiple showtimes
    runtime: { type: Number },
    original_language: { type: String },

    // Seat Layout
    seatLayout: seatLayoutSchema,

    // Ratings
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },

    // Images
    poster_path: { type: String },   // e.g. /uploads/posters/filename.jpg
    backdrop_path: { type: String }, // e.g. /uploads/backdrops/filename.jpg
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", showSchema);
