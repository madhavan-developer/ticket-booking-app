import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MoveLeftIcon, PlayIcon, StarIcon } from "lucide-react";
import Time from "../lib/TimeConvert";
import Preloader from "../components/Preloader";
import MovieCard from "../components/MovieCard";
import DateSelect from "../components/DateSelect";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/movies`);
        const allMovies = res.data;

        setMovies(allMovies);

        // Find the movie by _id from API
        const foundMovie = allMovies.find((m) => m._id === id);
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [id]);

  if (loading) return <Preloader />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!movie) return <p>No movie data available.</p>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="p-4 mx-6 sm:mx-6 md:mx-36 mt-36">
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 mb-10 text-gray-300 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
      >
        <MoveLeftIcon />
        <p>Back</p>
      </button>

      {/* Movie Main Info */}
      <div className="flex flex-col md:flex-row gap-6 md:w-2/3">
        <img
          className="w-full md:w-90 md:h-100 rounded-xl shadow-lg"
          src={movie.poster_path}
          alt={movie.title}
        />
        <div>
          <h1 className="text-xl text-[var(--primary-color)] font-bold">
            {movie.original_language}
          </h1>
          <h2 className="text-3xl font-bold mb-2">{movie.title}</h2>

          <p className="mb-4 text-gray-300">{movie.overview}</p>

          <div className="flex items-center">
            <p>
              {Time(movie.runtime)} -{" "}
              <span className="text-[var(--primary-color)]">
                {movie.genres.join(" | ")}
              </span>{" "}
              - {formatDate(movie.release_date)}
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="flex items-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-md cursor-pointer">
              <PlayIcon className="w-4 h-4" />
              Watch Trailer
            </button>
            <a
              href="#buy-tickets"
              className="bg-[var(--primary-color)] text-white py-2 px-4 rounded-md cursor-pointer"
            >
              Buy Tickets
            </a>
            <button className="bg-gray-700 text-white py-3 px-3 rounded-full cursor-pointer">
              <Heart className="w-6 h-6 text-gray-300 hover:text-[var(--primary-color)] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      <div className="mt-36" id="buy-tickets">
        {movie.showtimes && movie.showtimes.length > 0 ? (
          <DateSelect movieId={id} dateTimeData={movie.showtimes} />
        ) : (
          <p className="text-gray-400">No date data available.</p>
        )}
      </div>

      {/* You May Also Like */}
      <h2 className="text-2xl font-semibold mb-4 mt-36">You May Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {movies
          .filter((m) => m._id !== id)
          .slice(0, 4)
          .map((m) => (
            <MovieCard key={m._id} show={m} />
          ))}
      </div>

      <div className="flex justify-center mt-16">
        <button
          onClick={() => {
            navigate("/movies");
          }}
          className="px-4 py-2 text-lg bg-[var(--primary-color)] cursor-pointer rounded-lg hover:bg-red-500"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
