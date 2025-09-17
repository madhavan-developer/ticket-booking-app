// src/pages/admin/ListBookingShow.jsx
import React, { useEffect, useState } from "react";
import { formatDate } from "../../lib/DateFormate";
import Title from "../../components/admin/Title";
import { API_BASE_URL } from "../../utils/constants";
import Preloader from "../../components/Preloader";

const rupees = import.meta.env.VITE_CURRENCY || "₹";

const ListBookingShow = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Preloader />;

  return (
    <div className="px-4">
      <Title text1={"List"} text2={"Bookings"} />

      <table className="w-full text-left border-separate border-spacing-y-2 mt-6">
        <thead>
          <tr className="bg-[var(--primary-color)]/50 text-white text-[20px]">
            <th className="p-3 rounded-l-md">User Email</th>
            <th className="p-3">Movie Name</th>
            <th className="p-3">Show Time</th>
            <th className="p-3">Seats</th>
            <th className="p-3 rounded-r-md">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-400">
                No Bookings Found
              </td>
            </tr>
          ) : (
            bookings.map((booking, index) => {
              const seatCount = booking.bookedSeats?.length || 0;
              const seatList =
                seatCount > 0 ? booking.bookedSeats.join(", ") : "N/A";
              const amount =
                (booking.show?.showPrice || 0) * seatCount;

              return (
                <tr
                  key={booking._id || index}
                  className="bg-[var(--primary-color)]/20 text-white text-[16px]"
                >
                  <td className="p-3">
                    {booking.userEmail || "Unknown"}
                  </td>
                  <td className="p-3">
                    {booking.show?.movie?.title || "N/A"}
                  </td>
                  <td className="p-3">
                    {booking.show?.showDateTime
                      ? formatDate(booking.show.showDateTime)
                      : "N/A"}
                  </td>
                  <td className="p-3">{seatList}</td>
                  <td className="p-3">
                    {rupees}
                    {amount.toFixed(2)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListBookingShow;
