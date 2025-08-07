import { dummyShowsData } from "../assets/assets";
import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import Preloader from "../components/Preloader";
import { Frown } from "lucide-react";

const Favorite = () => {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return dummyShowsData.length > 0 ? (
    <div className="mt-36 px-4">
      {loading && (
        <div className="flex items-center justify-center h-screen">
          <Preloader />
        </div>
      )}
      <h2 className="text-2xl font-semibold mb-4 md:px-36 px-6">Favorite Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-36 mt-10">
        {dummyShowsData.map((show) => (
          <MovieCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  ) : (
    <div className="mt-36 px-4 h-100 flex flex-col items-center justify-center">
      <Frown className="w-12 h-12 text-gray-400" />
      <h2 className="text-2xl font-semibold mb-4 md:px-36 px-6">No <span className="text-[var(--primary-color)]">Movies</span> Found</h2>
    </div>
  );
};

export default Favorite;
