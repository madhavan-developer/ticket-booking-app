const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    overview: { type: String, required: true },
    genres: { type: [String], required: true },
    release_date: { type: String, required: true },
    tagline: String,
    showtimes: [{ type: Date }],
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
    runtime: Number,
    original_language: String,
    poster_path: { type: String },
    backdrop_path: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("movies", showSchema);
