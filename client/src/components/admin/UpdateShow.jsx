import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

const UpdateShow = ({ movieData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    genres: "",
    release_date: "",
    tagline: "",
    runtime: "",
    original_language: "",
    showtimes: [], // ✅ Added showtimes field
  });
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [newShowtime, setNewShowtime] = useState(null); // for adding new showtime
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Pre-fill fields when movieData changes
  useEffect(() => {
    if (movieData) {
      setFormData({
        title: movieData.title || "",
        overview: movieData.overview || "",
        genres: movieData.genres?.join(", ") || "",
        release_date: movieData.release_date || "",
        tagline: movieData.tagline || "",
        runtime: movieData.runtime || "",
        original_language: movieData.original_language || "",
        showtimes: movieData.showtimes || [], // ✅ load showtimes
      });
    }
  }, [movieData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    if (date) {
      const isoDate = date.toISOString().split("T")[0]; 
      setFormData({ ...formData, release_date: isoDate });
    }
  };

  const handlePosterUpload = (e) => {
    setPosterFile(e.target.files[0]);
  };

  const handleBackdropUpload = (e) => {
    setBackdropFile(e.target.files[0]);
  };

  // ✅ Add new showtime
  const handleAddShowtime = () => {
    if (newShowtime) {
      const isoDateTime = newShowtime.toISOString();
      setFormData({
        ...formData,
        showtimes: [...formData.showtimes, isoDateTime],
      });
      setNewShowtime(null);
    }
  };

  // ✅ Delete a showtime
  const handleDeleteShowtime = (index) => {
    const updated = [...formData.showtimes];
    updated.splice(index, 1);
    setFormData({ ...formData, showtimes: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!movieData?._id) return;

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "showtimes") {
          formData.showtimes.forEach((st, i) => {
            data.append(`showtimes[${i}]`, st);
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      if (posterFile) data.append("poster", posterFile);
      if (backdropFile) data.append("backdrop", backdropFile);

      await axios.put(`${API_BASE_URL}/movies/${movieData._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Movie updated successfully!");
      if (onSuccess) onSuccess(); // refresh dashboard
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setMessage("❌ Error updating data.");
      console.error("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800/20 text-white p-6 rounded-lg"
    >
      <h2 className="text-xl font-semibold mb-4">Update Show</h2>

      {/* Title */}
      <div className="mb-3">
        <label className="block mb-1">Title</label>
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
      <div className="mb-3">
        <label className="block mb-1">Overview</label>
        <textarea
          name="overview"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.overview}
          onChange={handleChange}
          rows="3"
          required
        />
      </div>

      {/* Genres */}
      <div className="mb-3">
        <label className="block mb-1">Genres (comma separated)</label>
        <input
          type="text"
          name="genres"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.genres}
          onChange={handleChange}
        />
      </div>

      {/* Release Date */}
      <div className="mb-3">
        <label className="block mb-1">Release Date</label>
        <div className="relative">
          <DatePicker
            selected={
              formData.release_date ? new Date(formData.release_date) : null
            }
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            className="w-full p-2 pr-10 rounded bg-zinc-800 border border-zinc-700"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Showtimes */}
      <div className="mb-3">
        <label className="block mb-1">Showtimes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.showtimes.map((st, index) => (
            <span
              key={index}
              className="bg-[var(--primary-color)] text-white px-3 py-1 rounded-full flex items-center gap-2"
            >
              {new Date(st).toLocaleString()}
              <button
                type="button"
                onClick={() => handleDeleteShowtime(index)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <DatePicker
            selected={newShowtime}
            onChange={(date) => setNewShowtime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="dd/MM/yyyy h:mm aa"
            placeholderText="Select date & time"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          />
          <button
            type="button"
            onClick={handleAddShowtime}
            className="bg-[var(--primary-color)] px-3 py-2 rounded text-white"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tagline */}
      <div className="mb-3">
        <label className="block mb-1">Tagline</label>
        <input
          type="text"
          name="tagline"
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
          value={formData.tagline}
          onChange={handleChange}
        />
      </div>

      {/* Runtime & Language */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block mb-1">Runtime (mins)</label>
          <input
            type="number"
            name="runtime"
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700"
            value={formData.runtime}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block mb-1">Language</label>
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
      <div className="mb-3">
        <label className="block mb-1">Poster Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePosterUpload}
          className="block w-full text-white file:bg-[var(--primary-color)] file:text-white file:rounded file:px-4 file:py-1 file:border-0"
        />
        {posterFile ? (
          <img
            src={URL.createObjectURL(posterFile)}
            alt="Poster Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        ) : movieData?.poster_path ? (
          <img
            src={movieData.poster_path}
            alt="Poster Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        ) : null}
      </div>

      {/* Backdrop Upload */}
      <div className="mb-4">
        <label className="block mb-1">Backdrop Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBackdropUpload}
          className="block w-full text-white file:bg-[var(--primary-color)] file:text-white file:rounded file:px-4 file:py-1 file:border-0"
        />
        {backdropFile ? (
          <img
            src={URL.createObjectURL(backdropFile)}
            alt="Backdrop Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        ) : movieData?.backdrop_path ? (
          <img
            src={movieData.backdrop_path}
            alt="Backdrop Preview"
            className="mt-2 w-24 h-auto rounded"
          />
        ) : null}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 font-semibold py-2 px-4 rounded-full"
      >
        {loading ? "Updating..." : "Update Show"}
      </button>

      {message && <p className="mt-3">{message}</p>}
    </form>
  );
};

export default UpdateShow;
