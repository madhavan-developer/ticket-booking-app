import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { dummyShowsData, dummyDateTimeData } from "../assets/assets";
import { Heart, MoveLeftIcon, PlayIcon, StarIcon } from "lucide-react";
import Time from "../lib/TimeConvert";
import Preloader from "../components/Preloader"; // ✅ Import Preloader
import MovieCard from "../components/MovieCard";
import { useNavigate } from "react-router-dom";
import DateSelect from "../components/DateSelect";

const MovieDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getShow = async () => {
      const idAsNumber = parseInt(id);
      const foundMovie = dummyShowsData.find((item) => item.id === idAsNumber);

      // Simulate loading delay
      setTimeout(() => {
        if (foundMovie) {
          setShow({
            movie: foundMovie,
            dateTime: dummyDateTimeData,
          });
        } else {
          console.warn("No movie found with id:", idAsNumber);
        }
      }, 2000); // ⏱️ 2 second delay
    };

    getShow();
  }, [id]);

  if (!show) {
    return <Preloader />;
  }

  const { movie } = show;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="p-4 mx-6 sm:mx-6 md:mx-36 mt-36">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 mb-10 text-gray-300 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
      >
        <MoveLeftIcon />
        <p>Back</p>
      </button>

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

          <div className="flex items-center gap-2 mb-4">
            <StarIcon className="text-yellow-500 fill-yellow-500" />
            <p className="text-gray-300">
              <span className="text-[var(--primary-color)]">
                {movie.vote_average.toFixed(1)}{" "}
              </span>{" "}
              IMDB Rating
            </p>
          </div>

          <p className="mb-4 text-gray-300">{movie.overview}</p>

          <div className="flex items-center">
            <p>
              {Time(movie.runtime)} -{" "}
              <span className="text-[var(--primary-color)]">
                {movie.genres.map((genre) => genre.name).join(" | ")}
              </span>{" "}
              - {formatDate(movie.release_date)}
            </p>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="flex items-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-md cursor-pointer">
              <PlayIcon className="w-4 h-4" />
              Watch Trailer
            </button>
            <a href="#buy-tickets" className="bg-[var(--primary-color)] text-white py-2 px-4 rounded-md cursor-pointer">
              Buy Tickets
            </a>
            <button className="bg-gray-700 text-white py-3 px-3 rounded-full cursor-pointer">
              <Heart className="w-6 h-6 text-gray-300 hover:text-[var(--primary-color)] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-36 ">
        <h2 className="text-2xl font-bold mb-8">Movie Actors</h2>
        <div className="flex overflow-x-auto gap-6 no-scrollbar">
          {movie.casts && movie.casts.length > 0 ? (
            movie.casts.slice(0, 12).map((actor, index) => (
              <div key={index} className="items-center gap-4 mt-4 ">
                <div className="flex flex-col w-40 items-center">
                  <img
                    className="w-26 h-26 rounded-full object-cover"
                    src={actor.profile_path}
                    alt={actor.name}
                  />
                  <div>
                    <h3 className="text-sm font-semibold">{actor.name}</h3>
                    <p className="text-gray-300">{actor.character}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No cast data available.</p>
          )}
        </div>
      </div>
      <div className="mt-36" id="buy-tickets">
        {dummyDateTimeData && Object.keys(dummyDateTimeData).length > 0 ? (
          <DateSelect movieId={id} dateTimeData={dummyDateTimeData} />
        ) : (
          <p className="text-gray-400">No date data available.</p>
        )}
      </div>
      <h2 className="text-2xl font-semibold mb-4 mt-36">You May Also Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {dummyShowsData
          .filter((show) => String(show.id) !== id) // Avoid matching the current movie
          .slice(0, 4)
          .map((show) => (
            <MovieCard key={show.id} show={show} />
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
