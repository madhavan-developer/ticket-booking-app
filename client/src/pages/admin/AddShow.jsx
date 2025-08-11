import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar,X } from "lucide-react";
import Title from "../../components/admin/Title";

const AddShow = () => {
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    genres: "",
    release_date: "",
    tagline: "",
    vote_average: "",
    vote_count: "",
    runtime: "",
    original_language: "",
  });

  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = date.toLocaleDateString("en-GB"); // dd/MM/yyyy
      setFormData({ ...formData, release_date: formattedDate });
    }
  };

  const handlePosterUpload = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleBackdropUpload = (e) => {
    setBackdropFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const updatedFormData = {
    ...formData,
    genres: formData.genres.split(",").map((g) => g.trim()),
  };

  const res = await fetch("http://localhost:5000/api/movies/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedFormData),
  });

  const data = await res.json();
  console.log(data);
};


  return (
   <div  className='px-4'>
      <Title text1={'Add'} text2={'Show'}/>
     <form
      onSubmit={handleSubmit}
      className="md:w-full mx-auto bg-zinc-800/20 text-white p-8 rounded-lg shadow-xl mt-10"
    >
      {/* Title */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          name="title"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      {/* Overview */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Overview</label>
        <textarea
          name="overview"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.overview}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      {/* Genres */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Genres (comma separated)</label>
        <input
          type="text"
          name="genres"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.genres}
          onChange={handleChange}
          required
        />
      </div>

      {/* Release Date */}
      <DateInput value={formData.release_date} onDateChange={handleDateChange} />

      {/* Tagline */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Tagline</label>
        <input
          type="text"
          name="tagline"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.tagline}
          onChange={handleChange}
        />
      </div>

      {/* Show Times */}
      <DateTimeMultiInput />

      {/* Vote Average & Vote Count */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Vote Average</label>
          <input
            type="number"
            step="0.1"
            name="vote_average"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            value={formData.vote_average}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Vote Count</label>
          <input
            type="number"
            name="vote_count"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            value={formData.vote_count}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Runtime & Language */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Runtime (mins)</label>
          <input
            type="number"
            name="runtime"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            value={formData.runtime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Original Language</label>
          <input
            type="text"
            name="original_language"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            value={formData.original_language}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Poster Upload */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Poster Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePosterUpload}
          className="block w-full text-white file:bg-[var(--primary-color)] file:text-white file:rounded file:px-4 file:py-1 file:border-0 file:cursor-pointer"
        />
        {posterFile && (
          <img
            src={URL.createObjectURL(posterFile)}
            alt="Poster Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        )}
      </div>

      {/* Backdrop Upload */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Backdrop Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBackdropUpload}
          className="block w-full text-white file:bg-[var(--primary-color)] file:text-white file:rounded file:px-4 file:py-1 file:border-0 file:cursor-pointer"
        />
        {backdropFile && (
          <img
            src={URL.createObjectURL(backdropFile)}
            alt="Backdrop Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 transition-colors font-semibold py-2 px-4 rounded-full"
      >
        Add Show
      </button>
    </form>
   </div>
  );
};

export default AddShow;

// -------------------------
// DateInput Component
// -------------------------
export const DateInput = ({ value, onDateChange }) => {
  const [startDate, setStartDate] = useState(null);

  const handleDateChange = (date) => {
    setStartDate(date);
    onDateChange(date);
  };

  return (
    <div className="mb-4 relative">
      <label className="block mb-1 font-medium">Release Date</label>
      <div className="react-datepicker-wrapper w-full">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText="dd/mm/yyyy"
          className="w-full p-2 pr-10 rounded bg-zinc-800 border border-zinc-700 text-white appearance-none"
          showPopperArrow={false}
          isClearable
        />
      </div>
      <Calendar className="absolute right-3 top-9 text-zinc-400 w-5 h-5 pointer-events-none" />
    </div>
  );
};

// -------------------------
// DateTimeMultiInput Component
// -------------------------


export const DateTimeMultiInput = () => {
  const [dateTime, setDateTime] = useState(null);
  const [dateTimeList, setDateTimeList] = useState([]);

  const handleAddDateTime = () => {
    if (dateTime) {
      setDateTimeList([...dateTimeList, dateTime]);
      setDateTime(null);
    }
  };

  const handleRemoveDateTime = (indexToRemove) => {
    setDateTimeList((prevList) =>
      prevList.filter((_, idx) => idx !== indexToRemove)
    );
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">Show Times (Date & Time)</label>
      <div className="relative flex gap-2">
        <DatePicker
          selected={dateTime}
          onChange={(date) => setDateTime(date)}
          showTimeSelect
          timeFormat="hh:mm aa"
          timeIntervals={1}
          dateFormat="dd/MM/yyyy hh:mm aa"
          placeholderText="dd/mm/yyyy hh:mm AM/PM"
          className="w-full p-2 pr-10 rounded bg-zinc-800 border border-zinc-700 text-white appearance-none"
          isClearable
          wrapperClassName="w-full"
        />
        <button
          type="button"
          onClick={handleAddDateTime}
          className="px-3 py-1 bg-[var(--primary-color)] rounded text-white hover:bg-[var(--primary-color)]/90 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Display added showtimes with remove button */}
      {dateTimeList.length > 0 && (
        <ul className="mt-2 space-y-2">
          {dateTimeList.map((dt, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded text-sm text-zinc-200"
            >
              <span>
                {dt.toLocaleString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour12: true,
                })}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveDateTime(idx)}
                className="text-red-400 hover:text-red-600 ml-4"
                aria-label="Remove date"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
