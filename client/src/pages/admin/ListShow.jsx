// src/pages/admin/ListShow.jsx
import React, { useEffect, useState } from "react";
import { formatDate } from "../../lib/DateFormate";
import Title from "../../components/admin/Title";
import { API_BASE_URL } from "../../utils/constants";
import Preloader from "../../components/Preloader";

const rupees = import.meta.env.VITE_CURRENCY || "₹";

const ListShow = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      // ✅ Get movies and bookings
      const [moviesRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/movies`),
        fetch(`${API_BASE_URL}/bookings`),
      ]);

      const movies = moviesRes.ok ? await moviesRes.json() : [];
      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];

      // ✅ Flatten movies into shows
      const showList = movies.flatMap((movie) =>
        (movie.showtimes || []).map((showtime) => {
          // Find bookings for this movie + showtime
          const relatedBookings = bookings.filter(
            (b) =>
              b.show?._id === movie._id &&
              new Date(b.show?.showDateTime).toISOString() ===
                new Date(showtime).toISOString()
          );

          // Count seats booked
          const totalBooking = relatedBookings.reduce(
            (sum, b) => sum + (b.bookedSeats?.length || 0),
            0
          );

          // Revenue = sum of showPrice for each paid booking
          const earning = relatedBookings
            .filter((b) => b.isPaid)
            .reduce((sum, b) => sum + (b.show?.showPrice || 0), 0);

          return {
            movieTitle: movie.title,
            showDateTime: showtime,
            totalBooking,
            earning,
          };
        })
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
            shows.map((show, idx) => (
              <tr
                key={idx}
                className="bg-[var(--primary-color)]/20 text-white text-[16px]"
              >
                <td className="p-3">{show.movieTitle}</td>
                <td className="p-3">
                  {show.showDateTime ? formatDate(show.showDateTime) : "N/A"}
                </td>
                <td className="p-3">{show.totalBooking}</td>
                <td className="p-3">
                  {rupees}
                  {show.earning.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListShow;
