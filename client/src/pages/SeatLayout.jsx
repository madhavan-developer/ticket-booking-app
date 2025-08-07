import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooking } from "../components/BookingContext";
import {
  assets,
  dummyDateTimeData,
  dummySeatLayout,
  dummyBookingData,
} from "../assets/assets";
import { Clock, CircleX } from "lucide-react";
import { toast } from "react-hot-toast";

const SeatLayout = () => {
  const { movieId } = useParams();
  const { bookingData } = useBooking();
  const navigate = useNavigate();

  const [selectedShowId, setSelectedShowId] = useState(null);
  const [selectedShowTime, setSelectedShowTime] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState({});

  const selectedDate = bookingData?.date;
  const showTimes = dummyDateTimeData[selectedDate] || [];

  useEffect(() => {
    if (!bookingData?.date || bookingData.movieId !== movieId) {
      navigate(`/movies/${movieId}`);
    }
  }, [bookingData, movieId, navigate]);

  // ✅ Update occupied seats based on selected showId + showTime
 useEffect(() => {
  if (!selectedShowId || !selectedShowTime) {
    setOccupiedSeats({});
    return;
  }

  const selectedTimeISO = new Date(selectedShowTime).toISOString();

  const matchedBookings = dummyBookingData.filter(
    (booking) =>
      booking.show._id === selectedShowId &&
      new Date(booking.show.showDateTime).toISOString() === selectedTimeISO
      
  );

  const booked = {};
  matchedBookings.forEach((booking) => {
    booking.bookedSeats.forEach((seat) => {
      booked[seat] = true;
    });
  });

  setOccupiedSeats(booked);
}, [selectedShowId, selectedShowTime]);


  const formatShowTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSelectShow = (showId, showTime) => {
    setSelectedShowId(showId);
    setSelectedShowTime(showTime); // ✅ Store actual show time
    setSelectedSeat([]); // Reset seat selection
  };

  const handleSeatSelect = (seatId) => {
    if (!selectedShowId || !selectedShowTime) {
      toast("Please select a show time first", {
        position: "top-right",
        icon: <CircleX />,
      });
      return;
    }

    if (occupiedSeats[seatId]) {
      toast("This seat is already booked", {
        position: "top-right",
        icon: <CircleX />,
      });
      return;
    }

    setSelectedSeat((prevSelected) =>
      prevSelected.includes(seatId)
        ? prevSelected.filter((seat) => seat !== seatId)
        : [...prevSelected, seatId]
    );
  };
  

  const renderSeats = (rowLabel, count = 8) => (
    <div key={rowLabel} className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, index) => {
        const seatId = `${rowLabel}${index + 1}`;
        const isSelected = selectedSeat.includes(seatId);
        const isOccupied = occupiedSeats[seatId];

        return (
          <div
            key={seatId}
            className={`w-10 h-10 rounded-md flex items-center justify-center border transition
              ${
                isOccupied
                  ? "bg-red-400  text-white cursor-not-allowed"
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

  if (!showTimes.length) {
    return (
      <div className="text-center mt-10 text-red-500">
        No Show Times Available
      </div>
    );
  }

  return (
    <div className="mt-36 mx-36 flex justify-between">
      {/* Sidebar - Show Times */}
      <div className="bg-[var(--primary-color)]/10 p-6 rounded-lg shadow-md w-1/4">
        <h2 className="text-2xl font-bold mb-4">Available Timings</h2>
        <div className="flex flex-col gap-4">
          {showTimes.map((show) => {
            const isSelected = selectedShowId === show.showId;
            return (
              <button
                key={show.showId}
                className={`${
                  isSelected
                    ? "bg-[var(--primary-color)] text-white"
                    : "hover:bg-[var(--primary-color)]/30 text-white"
                } font-semibold py-2 px-4 rounded-xl shadow flex items-center gap-2 transition-all`}
                onClick={() => handleSelectShow(show.showId, show.time)}
              >
                <Clock />
                {formatShowTime(show.time)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area - Seat Selection */}
      <div className="p-6 rounded-lg shadow-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Select your Seat</h2>
        <img src={assets.screenImage} alt="Screen Side" />
        <p className="text-sm text-gray-500 mb-6">Screen Side</p>

        {dummySeatLayout.groupings.map((group, index) => {
          if (group.layout === "stacked") {
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 mb-8"
              >
                {group.rows.map((rowLabel) =>
                  renderSeats(rowLabel, dummySeatLayout.seatsPerRow)
                )}
              </div>
            );
          }

          if (group.layout === "grid") {
            const rowPairs = [];
            for (let i = 0; i < group.rows.length; i += 2) {
              rowPairs.push(group.rows.slice(i, i + 2));
            }

            return (
              <div key={index} className="grid grid-cols-2 gap-12 mb-8">
                {rowPairs.map((pair, pairIndex) => (
                  <div key={pairIndex} className="flex flex-col gap-2">
                    {pair.map((rowLabel) =>
                      renderSeats(rowLabel, dummySeatLayout.seatsPerRow)
                    )}
                  </div>
                ))}
              </div>
            );
          }

          return null;
        })}

        {/* Selected Seat Display */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-center">Selected Seats:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeat.length > 0 ? (
              selectedSeat.map((seat) => (
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
        <button onClick={()=>{navigate('/mybookings')}} className="bg-[var(--primary-color)] px-10 py-3 mt-16 rounded-3xl cursor-pointer hover:bg-red-500">Proceed to Pay</button>
      </div>
    </div>
  );
};

export default SeatLayout;
