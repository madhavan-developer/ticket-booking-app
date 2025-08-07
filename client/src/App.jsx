import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatLayout from './pages/SeatLayout';
import Favorite from './pages/Favorite';
import Mybooking from './pages/MyBooking';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { BookingProvider } from './components/BookingContext'; // Context provider
import Layout from './pages/admin/Layout';
import Dashboard from './pages/admin/Dashboard';
import AddShow from './pages/admin/AddShow';
import ListBookingShow from './pages/admin/ListBookingShow';
import ListShow from './pages/admin/ListShow';

const App = () => {
  const isAdminpanel = useLocation().pathname.startsWith('/admin');

  return (
    <BookingProvider>
      <Toaster />
      {!isAdminpanel && <Navbar />}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/mybookings" element={<Mybooking />} />

        {/* ✅ Use this for safe context + URL support */}
        <Route path="/seat-selection/:movieId" element={<SeatLayout />} />


        <Route path='/admin/*' element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path='add-show' element={<AddShow/>}/>
          <Route path='book-show' element={<ListBookingShow/>}/>
          <Route path='list-show' element={<ListShow/>}/>
        </Route>

      </Routes>

      {!isAdminpanel && <Footer />}
    </BookingProvider>
  );
};

export default App;
