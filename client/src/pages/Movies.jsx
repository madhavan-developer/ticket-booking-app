import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import Preloader from "../components/Preloader";
import { Frown } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const Movies = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/movies`);
        setMovies(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Preloader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-36 px-4 h-100 flex flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return movies.length > 0 ? (
    <div className="mt-36 px-4">
      <h2 className="text-2xl font-semibold mb-4 md:px-36 px-6">Now Playing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-36 mt-10">
        {movies.map((movie) => (
          <MovieCard key={movie._id} show={movie} />
        ))}
      </div>
    </div>
  ) : (
    <div className="mt-36 px-4 h-100 flex flex-col items-center justify-center">
      <Frown className="w-12 h-12 text-gray-400" />
      <h2 className="text-2xl font-semibold mb-4 md:px-36 px-6">
        No <span className="text-[var(--primary-color)]">Movies</span> Found
      </h2>
    </div>
  );
};

export default Movies;
