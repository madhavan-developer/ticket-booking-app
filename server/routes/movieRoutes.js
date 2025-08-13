const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const router = express.Router();

// Create upload folders if not exist
const posterDir = path.join(__dirname, "../uploads/posters");
const backdropDir = path.join(__dirname, "../uploads/backdrops");
if (!fs.existsSync(posterDir)) fs.mkdirSync(posterDir, { recursive: true });
if (!fs.existsSync(backdropDir)) fs.mkdirSync(backdropDir, { recursive: true });

// Multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "poster") cb(null, posterDir);
    else if (file.fieldname === "backdrop") cb(null, backdropDir);
    else cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backdrop", maxCount: 1 }
  ]),
  createMovie
);

router.get("/", getMovies);
router.get("/:id", getMovieById);

router.put(
  "/:id",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backdrop", maxCount: 1 }
  ]),
  updateMovie
);

router.delete("/:id", deleteMovie);

module.exports = router;
