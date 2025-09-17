// src/pages/MyBooking.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import Preloader from "../components/Preloader";
import Time from "../lib/TimeConvert";
import { formatDate } from "/src/lib/DateFormate.js";
import { useBooking } from "../components/BookingContext";

const MyBooking = () => {
  const { bookingData, setBookingData } = useBooking();

  const currency = import.meta.env.VITE_CURRENCY;
  const API_URL = import.meta.env.VITE_API_URL;

  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();
  const navigate = useNavigate();

  const previewFromState = location.state?.bookingPayload || null;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewBooking, setPreviewBooking] = useState(previewFromState);
  const [hiddenBookings, setHiddenBookings] = useState([]);

  // ✅ Fetch bookings
  const getBookingData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${user.uid}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle payment success query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const bookingId = params.get("bookingId");

    if (success === "true" && bookingId) {
      // Optimistic UI update
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, isPaid: true } : b))
      );
      setPreviewBooking((prev) =>
        prev && prev._id === bookingId ? { ...prev, isPaid: true } : prev
      );

      // Update backend
      fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      })
        .then(() => getBookingData())
        .catch((err) => console.error("Error updating booking:", err));

      navigate("/mybookings", { replace: true });
    } else {
      getBookingData();
    }
  }, [location]);

  // ✅ Stripe Pay Now
  const handlePayNow = async (booking) => {
    try {
      const res = await fetch(
        `${API_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // ⬇️ include userEmail so backend can send mail later
          body: JSON.stringify({
            booking: {
              ...booking,
              userId: user?.uid,
              userEmail: user?.email,
            },
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err.message);
      alert(`Payment failed: ${err.message}`);
    }
  };

  // ✅ Cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCanceled: true,
          cancelReason: "User canceled",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, isCanceled: true, status: "canceled" }
            : b
        )
      );

      alert("Booking canceled successfully");
    } catch (err) {
      console.error("Error canceling booking:", err);
      alert(`Failed to cancel booking: ${err.message}`);
    }
  };

  // ✅ Remove from UI only (not DB)
  const handleDelete = (bookingId) => {
    if (!window.confirm("Are you sure you want to hide this booking?")) return;

    const updated = bookings.filter((b) => b._id !== bookingId);
    setBookings(updated);

    // 🔑 FIX: also clear previewBooking if it matches the deleted booking
    if (previewBooking && previewBooking._id === bookingId) {
      setPreviewBooking(null);
    }

    if (Array.isArray(bookingData.bookings)) {
      const updatedContext = {
        ...bookingData,
        bookings: bookingData.bookings.filter((b) => b._id !== bookingId),
      };
      setBookingData(updatedContext);
    }

    alert("Booking hidden from UI successfully");
  };

  const visibleBookings = bookings.filter(
    (b) => !hiddenBookings.includes(b._id)
  );

  // ✅ Render booking card
  const renderBookingCard = (booking) => {
    if (!booking?.show?.movie) return null;
    const { movie, showDateTime } = booking.show;

    return (
      <div
        key={booking._id || "preview"}
        className="flex flex-col md:flex-row justify-between bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 rounded-lg mt-4 p-4 max-w-3xl shadow-md"
      >
        <div className="flex flex-col md:flex-row w-full gap-4">
          <img
            className="md:max-w-48 aspect-video h-50 object-cover object-bottom rounded-lg"
            src={movie.poster_path || "/placeholder.jpg"}
            alt={movie.title}
          />

          <div className="flex flex-col md:flex-row justify-between flex-1">
            <div>
              <h3 className="text-2xl font-bold">
                {movie.title}
                <span className="text-sm text-gray-400 ml-2">
                  ({movie.original_language})
                </span>
              </h3>
              <p className="text-md text-gray-500">{Time(movie.runtime)}</p>
              <p className="text-md text-gray-400 mt-2">
                {formatDate(showDateTime)}
              </p>
            </div>

            <div className="flex flex-col text-right mt-4 md:mt-0">
              <div className="flex flex-wrap justify-end gap-3 items-center">
                {!booking.isPaid && !booking.isCanceled && (
                  <button
                    onClick={() => handlePayNow(booking)}
                    className="bg-[var(--primary-color)] cursor-pointer px-4 py-2 rounded-3xl hover:bg-red-500 text-sm transition"
                  >
                    Pay Now
                  </button>
                )}

                {booking.isPaid && !booking.isCanceled && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="bg-red-600 px-4 py-2 rounded-3xl text-white text-sm hover:bg-red-700 transition"
                  >
                    Cancel Booking
                  </button>
                )}

                {booking.isPaid && !booking.isCanceled && (
                  <p className="text-green-500 font-semibold mt-1">Paid</p>
                )}

                {booking.isCanceled && (
                  <p className="text-red-500 font-semibold mt-1">
                    Booking Canceled
                  </p>
                )}

                {!booking.isPaid && (
                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="bg-gray-600 px-4 py-2 rounded-3xl text-white text-sm hover:bg-gray-700 transition"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-md text-gray-500 mt-1">
                Total Tickets: {booking.bookedSeats?.length || 0}
              </p>
              <p className="text-md text-gray-500 mt-1">
                Seats: {booking.bookedSeats?.join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <Preloader />;

  return (
    <div className="mx-4 md:mx-36 mt-36 md:w-5/10">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      {bookings.length === 0 && !previewBooking ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-lg shadow-sm">
          <img
            src="/src/assets/empty-box.png"
            alt="No bookings"
            className="w-40 h-40 mb-6 opacity-80"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Bookings Yet
          </h3>
          <p className="text-gray-500 max-w-md mb-6">
            It looks like you haven’t booked any tickets yet. Start exploring
            movies and reserve your seats now!
          </p>
          <button
            onClick={() => navigate("/movies")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full transition-all"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <>
          {previewBooking && renderBookingCard(previewBooking)}
          {bookings.map((b) => renderBookingCard(b))}
        </>
      )}
    </div>
  );
};

export default MyBooking;
