const Movie = require("../models/movie.js");

// Create a movie
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      overview,
      genres,
      release_date,
      tagline,
      showtimes,
      vote_average,
      vote_count,
      runtime,
      original_language
    } = req.body;

    const posterPath = req.files?.poster
      ? `/uploads/posters/${req.files.poster[0].filename}`
      : null;

    const backdropPath = req.files?.backdrop
      ? `/uploads/backdrops/${req.files.backdrop[0].filename}`
      : null;

    const newMovie = new Movie({
      title,
      overview,
      genres: genres ? genres.split(",").map((g) => g.trim()) : [],
      release_date,
      tagline,
      showtimes: showtimes ? JSON.parse(showtimes).map(dt => new Date(dt)) : [],
      vote_average,
      vote_count,
      runtime,
      original_language,
      poster_path: posterPath,
      backdrop_path: backdropPath,
    });

    await newMovie.save();

    res.status(201).json({
      message: "Movie created successfully",
      movie: newMovie
    });
  } catch (error) {
    console.error("Error creating movie:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Get all movies
exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update movie
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    Object.assign(movie, req.body);

    if (req.files?.poster) {
      movie.poster_path = `/uploads/posters/${req.files.poster[0].filename}`;
    }
    if (req.files?.backdrop) {
      movie.backdrop_path = `/uploads/backdrops/${req.files.backdrop[0].filename}`;
    }

    await movie.save();
    res.json({ message: "Movie updated successfully", movie });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete movie
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
