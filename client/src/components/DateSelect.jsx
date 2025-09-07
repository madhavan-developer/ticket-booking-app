// src/components/DateSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../components/BookingContext";

/** Robustly parse showtime values that might be:
 *  - ISO: "2025-09-05T03:30:00.000Z"
 *  - Locale string: "9/6/2025, 6:30:00 PM" (MM/DD/YYYY or DD/MM/YYYY)
 * Returns a valid Date or null.
 */
function parseShowtime(val) {
  if (!val) return null;

  // Already a Date?
  if (val instanceof Date && !isNaN(val)) return val;

  // Try ISO/native first
  const d1 = new Date(val);
  if (!isNaN(d1)) return d1;

  // Try to parse "dd/mm/yyyy hh:mm AM/PM" or "mm/dd/yyyy hh:mm AM/PM"
  // Split date and time
  const [datePart, timePartRaw = "00:00"] = String(val).split(/[ ,]+(?=\d{1,2}:\d{2})|,\s*/);
  if (!datePart) return null;

  // Extract date numbers
  const slash = datePart.split("/");
  if (slash.length < 3) return null;

  let a = parseInt(slash[0], 10);
  let b = parseInt(slash[1], 10);
  let y = parseInt(slash[2], 10);
  if (!a || !b || !y) return null;

  // Extract time
  let hh = 0, mm = 0;
  let isPM = /PM/i.test(val);
  let m = timePartRaw.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    hh = parseInt(m[1], 10);
    mm = parseInt(m[2], 10);
    if (isPM && hh < 12) hh += 12;
    if (!isPM && /AM/i.test(val) && hh === 12) hh = 0;
  }

  // Heuristic: if a > 12, it's DD/MM; if b > 12, it's MM/DD.
  // If both <= 12, default to DD/MM (common outside US).
  let dd, MM;
  if (a > 12 && b <= 12) {
    dd = a; MM = b;
  } else if (b > 12 && a <= 12) {
    dd = b; MM = a;
  } else {
    // ambiguous, assume DD/MM
    dd = a; MM = b;
  }

  // Construct local date
  const safe = new Date(y, MM - 1, dd, hh, mm, 0);
  return isNaN(safe) ? null : safe;
}

/** Normalize date to midnight for grouping (local) */
function atMidnightLocal(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

const DateSelect = ({ dateTimeData = [], movieId }) => {
  const navigate = useNavigate();
  const { setBookingData } = useBooking();

  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const scrollRef = useRef(null);
  const btnRef = useRef(null);
  const [scrollAmount, setScrollAmount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Parse & group incoming showtimes by date (local)
  const { uniqueDates, byDate } = useMemo(() => {
    const parsed = (Array.isArray(dateTimeData) ? dateTimeData : [])
      .map(parseShowtime)
      .filter(Boolean)
      .sort((a, b) => a - b);

    const map = new Map();
    for (const dt of parsed) {
      const key = atMidnightLocal(dt).toDateString(); // stable key per day
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(dt);
    }
    const keys = Array.from(map.keys());
    return { uniqueDates: keys, byDate: map };
  }, [dateTimeData]);

  // Set first date as selected by default
  useEffect(() => {
    if (uniqueDates.length > 0) setSelectedDateKey(uniqueDates[0]);
  }, [uniqueDates]);

  useEffect(() => {
    if (btnRef.current) {
      setScrollAmount(btnRef.current.offsetWidth + 12);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setVisibleCount(window.innerWidth < 640 ? 2 : 5);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollOne = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleBookNow = () => {
    if (!selectedDateKey) {
      toast.error("Please select a date before booking");
      return;
    }
    setBookingData({ movieId, date: selectedDateKey });
    navigate(`/seat-selection/${movieId}`);
  };

  // Touch swipe
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

      {uniqueDates.length === 0 ? (
        <p className="text-gray-400">No date data available.</p>
      ) : (
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
              {uniqueDates.map((key, idx) => {
                const d = new Date(key); // already normalized
                const weekday = d.toLocaleDateString("en-GB", { weekday: "short" }); // Sat
                const dd = String(d.getDate()).padStart(2, "0"); // 06
                const mon = d.toLocaleDateString("en-GB", { month: "short" }); // Sep
                const isActive = key === selectedDateKey;

                return (
                  <button
                    key={key}
                    ref={idx === 0 ? btnRef : null}
                    onClick={() => setSelectedDateKey(key)}
                    className={`w-24 h-20 flex-shrink-0 flex flex-col items-center justify-center rounded-lg border cursor-pointer transition-colors
                      ${isActive ? "bg-[var(--primary-color)] text-white" : "border-[var(--primary-color)] text-gray-200 hover:bg-[var(--primary-color)] hover:text-white"}`}
                    title={d.toLocaleDateString()}
                  >
                    <span className="text-sm">{weekday}</span>
                    <span className="text-lg font-semibold">
                      {dd} {mon}
                    </span>
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
      )}
    </div>
  );
};

export default DateSelect;
