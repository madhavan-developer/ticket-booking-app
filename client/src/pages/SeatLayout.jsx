// src/pages/SeatLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "../components/BookingContext";
import { assets } from "../assets/assets";
import { Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const SeatLayout = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { bookingData } = useBooking();

  const [movie, setMovie] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedShowTime, setSelectedShowTime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/movies/${movieId}`);
        setMovie(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  // ✅ Fetch bookings for this movie when showtime changes
  useEffect(() => {
    if (!selectedShowTime) return;

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/bookings?movieId=${movieId}&showtime=${selectedShowTime}`
        );
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load booked seats");
      }
    };
    fetchBookings();
  }, [movieId, selectedShowTime]);

  // ✅ Mark occupied seats
  useEffect(() => {
    const booked = {};
    bookings.forEach((booking) => {
      booking.bookedSeats.forEach((seat) => {
        booked[seat] = true;
      });
    });
    setOccupiedSeats(booked);
  }, [bookings]);

  const formatShowTime = (isoTime) =>
    new Date(isoTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleSelectShow = (time) => {
    setSelectedShowTime(time);
    setSelectedSeats([]);
  };

  const handleSeatSelect = (seatId) => {
    if (!selectedShowTime) {
      toast.error("Please select a show time first");
      return;
    }
    if (occupiedSeats[seatId]) {
      toast.error("This seat is already booked");
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const renderSeats = (rowLabel, count = 8) => (
    <div key={rowLabel} className="flex gap-2 justify-center">
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${rowLabel}${i + 1}`;
        const isSelected = selectedSeats.includes(seatId);
        const isOccupied = occupiedSeats[seatId];

        return (
          <div
            key={seatId}
            className={`w-10 h-10 rounded-md flex items-center justify-center border transition
              ${
                isOccupied
                  ? "bg-red-400 text-white cursor-not-allowed"
                  : isSelected
                  ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)]/10 cursor-pointer"
                  : "border-[var(--primary-color)]/40 text-white hover:bg-[var(--primary-color)]/60 cursor-pointer"
              }`}
            onClick={() => !isOccupied && handleSeatSelect(seatId)}
          >
            {seatId}
          </div>
        );
      })}
    </div>
  );

  // ✅ Get seat price based on group
  const getSeatPrice = (seatId) => {
    for (const group of movie.seatLayout.groupings) {
      if (group.rows.some((row) => seatId.startsWith(row))) {
        return group.price;
      }
    }
    return 0;
  };

  const handleProceed = () => {
    if (!selectedShowTime || selectedSeats.length === 0) {
      toast.error("Select a showtime and at least one seat");
      return;
    }

    // ✅ Calculate total price
    const totalPrice = selectedSeats.reduce((total, seatId) => {
      return total + getSeatPrice(seatId);
    }, 0);

    const bookingPayload = {
      movie,
      show: {
        _id: movie._id,
        movie: movie,
        showDateTime: selectedShowTime,
        showPrice: totalPrice, // ✅ dynamic total price
      },
      bookedSeats: selectedSeats,
      isPaid: false,
    };

    navigate("/mybookings", { state: { bookingPayload } });
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-400">Loading...</div>;
  if (!movie)
    return (
      <div className="text-center mt-10 text-red-500">Movie not found</div>
    );

  return (
    <div className="mt-36 mx-36 flex justify-between">
      {/* Sidebar - Show Times */}
      <div className="bg-[var(--primary-color)]/10 p-6 rounded-lg shadow-md w-1/4">
        <h2 className="text-2xl font-bold mb-4">Available Timings</h2>
        <div className="flex flex-col gap-4">
          {movie.showtimes.map((time, idx) => (
            <button
              key={idx}
              className={`${
                selectedShowTime === time
                  ? "bg-[var(--primary-color)] text-white"
                  : "hover:bg-[var(--primary-color)]/30 text-white"
              } font-semibold py-2 px-4 rounded-xl shadow flex items-center gap-2 transition-all`}
              onClick={() => handleSelectShow(time)}
            >
              <Clock /> {formatShowTime(time)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area - Seat Selection */}
      <div className="p-6 rounded-lg shadow-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Select your Seat
        </h2>
        <img src={assets.screenImage} alt="Screen Side" />
        <p className="text-sm text-gray-500 mb-6">Screen Side</p>

        {movie.seatLayout.groupings.map((group, index) => {
          const price = group.price;
          const isTwoRows = group.rows.length === 2;

          return (
            <div key={index} className="mb-8">
              {/* Group Price */}
              <div className="flex justify-center mb-2">
                <span className="text-sm text-gray-400">
                  Group Price – ₹{price}
                </span>
              </div>

              {/* Group Layout */}
              {group.layout === "grid" ? (
                <div className="flex justify-center">
                  <div
                    className={`grid gap-12 ${
                      isTwoRows ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {group.rows
                      .reduce((acc, row, i) => {
                        if (i % 2 === 0) acc.push(group.rows.slice(i, i + 2));
                        return acc;
                      }, [])
                      .map((pair, pairIndex) => (
                        <div
                          key={pairIndex}
                          className={`flex flex-col gap-2 ${
                            isTwoRows ? "items-center" : ""
                          }`}
                        >
                          {pair.map((rowLabel) =>
                            renderSeats(rowLabel, movie.seatLayout.seatsPerRow)
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex flex-col gap-2 ${
                    isTwoRows ? "items-center" : "items-start"
                  }`}
                >
                  {group.rows.map((rowLabel) =>
                    renderSeats(rowLabel, movie.seatLayout.seatsPerRow)
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Selected Seats */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Selected Seats:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((seat) => (
                <span
                  key={seat}
                  className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-md"
                >
                  {seat}
                </span>
              ))
            ) : (
              <span className="text-gray-500">No seats selected</span>
            )}
          </div>
        </div>

        <button
          onClick={handleProceed}
          className="bg-[var(--primary-color)] px-10 py-3 mt-16 rounded-3xl cursor-pointer hover:bg-red-500"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
