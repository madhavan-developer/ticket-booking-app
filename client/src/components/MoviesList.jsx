import { MoveRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import Preloader from "./Preloader"; // Optional loading spinner

const MoviesList = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/movies`);
        setMovies(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <Preloader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="my-10">
      <div className="mt-36 flex items-center justify-between md:px-36 sm:px-4 px-2">
        <h2 className="text-2xl font-semibold mb-4">Now Playing</h2>
        <p
          onClick={() => navigate("/movies")}
          className="flex items-center gap-3 cursor-pointer hover:text-[var(--primary-color)]"
        >
          View More <MoveRightIcon />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-36 mt-10">
        {movies.slice(0, 4).map((movie) => (
          <MovieCard key={movie._id} show={movie} />
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

export default MoviesList;
