import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import Preloader from "../components/Preloader";
import Time from "../lib/TimeConvert";
import { formatDate } from "/src/lib/DateFormate.js";

const MyBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();
  const navigate = useNavigate();

  const previewFromState = location.state?.bookingPayload || null;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewBooking, setPreviewBooking] = useState(previewFromState);

  // ✅ Fetch booking data from DB
  const getBookingData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/${user.uid}`
      );
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle payment success or fetch all bookings
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    const bookingId = params.get("bookingId");

    if (success === "true" && bookingId) {
      // ✅ Mark booking as paid in DB
      fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      })
        .then(() => {
          getBookingData();
          setPreviewBooking(null); // ✅ Clear preview after payment
        })
        .catch((err) => console.error("Error updating booking:", err));

      navigate("/mybookings", { replace: true }); // Clean up query params
    } else {
      getBookingData();
    }
  }, [location]);

  // ✅ Handle Stripe Pay Now
  const handlePayNow = async (booking) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned from Stripe");
      }
    } catch (err) {
      console.error("Stripe checkout error:", err.message);
      alert(`Payment failed: ${err.message}`);
    }
  };

  // ✅ Reusable Booking Card UI
  const renderBookingCard = (booking, isPreview = false) => (
    <div
      key={booking._id || "preview"}
      className="flex flex-col md:flex-row justify-between bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 rounded-lg mt-4 p-4 max-w-3xl shadow-md"
    >
      <div className="flex flex-col md:flex-row w-full gap-4">
        <img
          className="md:max-w-48 aspect-video h-50 object-cover object-bottom rounded-lg"
          src={booking.show.movie.poster_path}
          alt={booking.show.movie.title}
        />
        <div className="flex flex-col md:flex-row justify-between flex-1">
          <div className="flex flex-col justify-start">
            <div>
              <h3 className="text-2xl font-bold">
                {booking.show.movie.title}
                <span className="text-sm text-gray-400 font-normal ml-2">
                  ({booking.show.movie.original_language})
                </span>
              </h3>
              <p className="text-md text-gray-500">
                {Time(booking.show.movie.runtime)}
              </p>
            </div>
            <p className="text-md text-gray-400 mt-2">
              {formatDate(booking.show.showDateTime)}
            </p>
          </div>
          <div className="flex flex-col justify-start text-right mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row justify-end items-end gap-4">
              <h2 className="text-2xl font-bold">
                {currency}
                {booking.show.showPrice}
              </h2>
              {!booking.isPaid && (
                <button
                  onClick={() => handlePayNow(booking)}
                  className="bg-[var(--primary-color)] px-4 py-2 rounded-3xl cursor-pointer hover:bg-red-500 text-sm transition"
                >
                  Pay Now
                </button>
              )}
            </div>
            <p className="text-md text-gray-500 mt-1">
              Total Tickets: {booking.bookedSeats.length}
            </p>
            <p className="text-md text-gray-500 mt-1">
              Selected Seats: {booking.bookedSeats.join(", ")}
            </p>
            {booking.isPaid && (
              <p className="text-green-400 font-semibold mt-1">Paid</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <Preloader />;

  return (
    <div className="mx-4 md:mx-36 mt-36 md:w-5/10">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      {/* ✅ Preview Booking Before Payment */}
      {previewBooking && renderBookingCard(previewBooking, true)}

      {/* ✅ Past Bookings After Payment */}
      {bookings.length === 0 && !previewBooking ? (
        <p className="text-gray-400 mt-4">No bookings found.</p>
      ) : (
        bookings.map((item) => renderBookingCard(item))
      )}
    </div>
  );
};

export default MyBooking;
