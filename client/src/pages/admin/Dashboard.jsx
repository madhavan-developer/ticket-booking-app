import React, { useState, useEffect, useRef } from "react";
import {
  ChartLineIcon,
  BadgeDollarSign,
  CirclePlay,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Title from "../../components/admin/Title";
import Preloader from "../../components/Preloader";
import { formatDate } from "../../lib/DateFormate";
import { API_BASE_URL } from "../../utils/constants";
import Modal from "../../components/admin/Modal";
import UpdateShow from "../../components/admin/UpdateShow"

/* ---------------- Dropdown Menu ---------------- */
const DropdownMenu = ({ movie, onDelete, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3-dot button */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-700"
      >
        <MoreVertical className="w-5 h-5 text-white" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-10 right-0 bg-[#1f1f1f] border border-gray-700 rounded-lg shadow-lg w-32 z-20">
          <button
            onClick={() => {
              setOpen(false);
              onUpdate(movie);
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-700"
          >
            <Pencil className="w-4 h-4" /> Update
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete(movie._id);
            }}
            className="flex items-center gap-2 px-4 py-2 w-full text-left text-red-500 hover:bg-gray-700"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------------- Dashboard ---------------- */
const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [movieToUpdate, setMovieToUpdate] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`);
      const movies = await res.json();

      const data = {
        totalBookings: 0, // placeholder
        totalRevenue: 0, // placeholder
        activeShows: movies,
        totalUsers: 0, // placeholder
      };

      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDashboardData((prev) => ({
          ...prev,
          activeShows: prev.activeShows.filter((m) => m._id !== movieId),
        }));
      } else {
        console.error("Failed to delete movie");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleUpdate = (movie) => {
    setMovieToUpdate(movie);
    setUpdateModalOpen(true);
  };

  if (loading || !dashboardData) {
    return <Preloader />;
  }

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings,
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: `${currency}${dashboardData.totalRevenue.toLocaleString()}`,
      icon: BadgeDollarSign,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length,
      icon: CirclePlay,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
    },
  ];

  return (
    <div className="px-4">
      <Title text1={"Admin"} text2={"Dashboard"} />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {dashboardCards.map((data, index) => (
          <div
            key={index}
            className="bg-gradient-to-b from-[#2a0f18] to-[#1a0b10] border border-[#4b1d26] rounded-xl p-6 shadow-md text-white flex justify-between items-center hover:scale-[1.02] transition-transform duration-200"
          >
            <div>
              <p className="text-sm text-gray-300 mb-2">{data.title}</p>
              <h2 className="text-2xl font-semibold">{data.value}</h2>
            </div>
            <data.icon className="w-12 h-auto text-white/90" />
          </div>
        ))}
      </div>

      {/* Active Shows */}
      <h3 className="text-2xl mt-20">Active Shows</h3>

      {dashboardData.activeShows.length === 0 ? (
        <p className="text-gray-400 mt-5 text-lg">No Active Shows</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {dashboardData.activeShows.map((movie) => {
            const prices =
              movie.seatLayout?.groupings?.map((g) => g.price) || [];
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            return (
              <div
                key={movie._id}
                className="flex flex-col gap-4 bg-[#12161C] p-4 rounded-2xl text-white relative"
              >
                {/* Dropdown Menu */}
                <div className="absolute bottom-3 right-3">
                  <DropdownMenu
                    movie={movie}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                </div>

                <img
                  src={movie.backdrop_path}
                  alt={movie.title || "Movie Poster"}
                  className="w-full h-64 object-cover rounded-lg cursor-pointer"
                />
                <h3 className="text-xl font-semibold">{movie.title}</h3>

                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-2xl font-bold">
                    {currency}
                    {minPrice}
                    {minPrice !== maxPrice ? ` - ${currency}${maxPrice}` : ""}
                  </h3>
                </div>

                <p className="text-md text-gray-400">
                  {movie.release_date ? formatDate(movie.release_date) : "N/A"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Movie Modal */}
      <Modal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title={`Update Show: ${movieToUpdate?.title}`}
      >
        <UpdateShow
          movieData={movieToUpdate}
          onClose={() => setUpdateModalOpen(false)}
          onSuccess={fetchMovies}
        />
      </Modal>
    </div>
  );
};
 
export default Dashboard;
