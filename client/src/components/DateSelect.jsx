// src/components/DateSelect.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../components/BookingContext";

const DateSelect = ({ dateTimeData, movieId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const { setBookingData } = useBooking();
  const scrollRef = useRef(null);
  const btnRef = useRef(null);
  const [scrollAmount, setScrollAmount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const navigate = useNavigate();

  const dates = Object.keys(dateTimeData || {});

  useEffect(() => {
    if (btnRef.current) {
      setScrollAmount(btnRef.current.offsetWidth + 12);
    }
  }, []);

  const scrollOne = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBookNow = () => {
    if (!selectedDate) {
      toast.error("Please select a date before booking");
      return;
    }

    setBookingData({ movieId, date: selectedDate });
    navigate(`/seat-selection/${movieId}`);
  };

  useEffect(() => {
    const resizeHandler = () => {
      setVisibleCount(window.innerWidth < 640 ? 2 : 5);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchMove = (e) => setTouchEndX(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const delta = touchStartX - touchEndX;
    if (delta > 50) scrollOne("right");
    else if (delta < -50) scrollOne("left");
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="p-4 mt-20 rounded-lg text-white bg-[#F845651A]">
      <h2 className="text-xl font-semibold mb-6">Choose Date</h2>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => scrollOne("left")} className="p-2 rounded hover:bg-primary">
            <ChevronLeft />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar"
            style={{ width: scrollAmount * visibleCount || 350 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {dates.map((dateStr, index) => {
              const date = new Date(dateStr);
              const day = date.toLocaleDateString("en-GB", { weekday: "short" });
              const dateNum = date.getDate();
              const isActive = selectedDate === dateStr;

              return (
                <button
                  key={index}
                  ref={index === 0 ? btnRef : null}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center rounded-lg border 
                    ${isActive
                      ? "bg-[var(--primary-color)] text-white"
                      : "border-[var(--primary-color)] text-gray-200"
                    } cursor-pointer hover:bg-[var(--primary-color)] hover:text-white transition-colors`}
                >
                  <span className="text-sm">{day}</span>
                  <span className="text-lg font-semibold">{dateNum}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => scrollOne("right")} className="p-2 rounded hover:bg-primary">
            <ChevronRight />
          </button>
        </div>

        <button
          onClick={handleBookNow}
          className="md:ml-auto bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg hover:opacity-90 w-full sm:w-auto cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
