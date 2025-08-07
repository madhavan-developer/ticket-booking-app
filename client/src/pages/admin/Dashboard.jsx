import React, { useState, useEffect } from 'react';
import { ChartLineIcon, BadgeDollarSign, CirclePlay, Users, StarIcon } from 'lucide-react';
import { dummyDashboardData } from '../../assets/assets'; // Import your actual dummy dashboard data
import Title from '../../components/admin/Title';
import Time from '../../lib/TimeConvert';
import Preloader from '../../components/Preloader';
import { formatDate } from '../../lib/DateFormate';

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$';

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace this with actual API call in future
        const data = {
          totalBookings: dummyDashboardData.totalBookings,
          totalRevenue: dummyDashboardData.totalRevenue,
          activeShows: dummyDashboardData.activeShows,
          totalUsers: dummyDashboardData.totalUser,
        };

        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return <Preloader />;
  }

  const dashboardCards = [
    { title: 'Total Bookings', value: dashboardData.totalBookings, icon: ChartLineIcon },
    { title: 'Total Revenue', value: `${currency}${dashboardData.totalRevenue.toLocaleString()}`, icon: BadgeDollarSign },
    { title: 'Active Shows', value: dashboardData.activeShows.length, icon: CirclePlay },
    { title: 'Total Users', value: dashboardData.totalUsers, icon: Users },
  ];

  return (
    <div className='px-4'>
      <Title text1={'Admin'} text2={'Dashboard'} />

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {dashboardCards.map((data, index) => (
          <div
            key={index}
            className="bg-gradient-to-b from-[#2a0f18] to-[#1a0b10] border border-[#4b1d26] rounded-xl p-6 shadow-md text-white flex justify-between items-center hover:scale-[1.02] transition-transform duration-200"
          >
            <div>
              <p className="text-sm text-gray-300 mb-2">{data.title}</p>
              <h2 className="text-2xl font-semibold">{data.value}</h2>
            </div>
            <data.icon className="w-12 h-auto text-white/90" />
          </div>
        ))}
      </div>

      {/* Active Shows */}
      <h3 className='text-2xl mt-20'>Active Shows</h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5'>
        {dashboardData.activeShows.map((show) => {
          const movie = show.movie;

          return (
            <div key={show._id} className='flex flex-col gap-4 bg-[#12161C] p-4 rounded-2xl text-white'>
              <img
                src={movie.backdrop_path}
                alt={movie.title || "Movie Poster"}
                className='w-full h-64 object-cover rounded-lg cursor-pointer'
              />
              <h3 className='text-xl font-semibold'>{movie.title}</h3>
              
              <div className='flex items-center justify-between mt-2'>
                <h3 className='text-3xl font-bold'>{currency}{show.showPrice}</h3>
                <div className='flex items-center gap-1'>
                  <StarIcon className='text-yellow-400 fill-yellow-400' />
                  <span className='text-lg'>{movie.vote_average?.toFixed(1) || "0.0"}</span>
                </div>
              </div>
              <p className='text-md text-gray-400'>{formatDate(show.showDateTime)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
