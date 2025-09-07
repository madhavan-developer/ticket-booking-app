// src/pages/admin/ListShow.jsx
import React, { useEffect, useState } from "react";
import { formatDate } from "../../lib/DateFormate";
import Title from "../../components/admin/Title";
import { API_BASE_URL } from "../../utils/constants";
import Preloader from "../../components/Preloader";

const rupees = import.meta.env.VITE_CURRENCY;

const ListShow = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies on mount
  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/movies`);
      const movies = await res.json();

      // Flatten movie -> showtimes into "shows"
      const showList = movies.flatMap((movie) =>
        (movie.showtimes || []).map((showtime) => ({
          movieTitle: movie.title,
          showDateTime: showtime,
          occupiedSeats: movie.occupiedSeats || {}, // adjust if your schema is different
          priceRange:
            movie.seatLayout?.groupings?.map((g) => g.price) || [0],
        }))
      );

      setShows(showList);
    } catch (err) {
      console.error("Failed to fetch shows:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Preloader />;

  return (
    <div className="px-4">
      <Title text1={"List"} text2={"Show"} />

      <table className="w-full text-left border-separate border-spacing-y-1 mt-6">
        <thead>
          <tr className="bg-[var(--primary-color)]/50 text-white text-[20px]">
            <th className="p-3 rounded-l-md">Movie Name</th>
            <th className="p-3">Show Time</th>
            <th className="p-3">Total Booking</th>
            <th className="p-3 rounded-r-md">Earning</th>
          </tr>
        </thead>
        <tbody>
          {shows.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-400">
                No Shows Found
              </td>
            </tr>
          ) : (
            shows.map((show, idx) => {
              const totalBooking = Object.keys(show.occupiedSeats || {}).length;
              const avgPrice =
                show.priceRange.reduce((a, b) => a + b, 0) /
                show.priceRange.length;
              const earning = `${rupees}${(totalBooking * avgPrice).toFixed(2)}`;

              return (
                <tr
                  key={idx}
                  className="bg-[var(--primary-color)]/20 text-white text-[16px]"
                >
                  <td className="p-3">{show.movieTitle}</td>
                  <td className="p-3">
                    {show.showDateTime ? formatDate(show.showDateTime) : "N/A"}
                  </td>
                  <td className="p-3">{totalBooking}</td>
                  <td className="p-3">{earning}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListShow;
