import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import Favorite from "./pages/Favorite";
import Mybooking from "./pages/MyBooking";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import { BookingProvider } from "./components/BookingContext";

// Admin Pages
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShow from "./pages/admin/AddShow";
import ListBookingShow from "./pages/admin/ListBookingShow";
import ListShow from "./pages/admin/ListShow";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

const App = () => {
  const location = useLocation();

  const isAdminpanel = location.pathname.startsWith("/admin");
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <BookingProvider>
      <Toaster />
      {!isAdminpanel && !isAuthPage && <Navbar />}
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <Movies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <MovieDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorite"
          element={
            <ProtectedRoute>
              <Favorite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mybookings"
          element={
            <ProtectedRoute>
              <Mybooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seat-selection/:movieId"
          element={
            <ProtectedRoute>
              <SeatLayout />
            </ProtectedRoute>
          }
        />

        {/* Admin (also protected) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-show" element={<AddShow />} />
          <Route path="book-show" element={<ListBookingShow />} />
          <Route path="list-show" element={<ListShow />} />
        </Route>
      </Routes>

      {!isAdminpanel && !isAuthPage && <Footer />}
    </BookingProvider>
  );
};

export default App;
