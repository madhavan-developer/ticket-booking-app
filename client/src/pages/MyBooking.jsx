import React, { useEffect, useState } from 'react'
import {dummyBookingData} from '../assets/assets'
import Preloader from "../components/Preloader";
import Time from '../lib/TimeConvert'
import { formatDate } from "/src/lib/DateFormate.js";

const MyBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings,setBookings] = useState([]);
  const [isLoading,setIsLoading] = useState(true);

  const getBookingData = async()=>{
    setBookings(dummyBookingData)
    setIsLoading(false);
  }

  useEffect(()=>{
    getBookingData()
  },[])

  return !isLoading ? (
    <div className='mx-4 md:mx-36 mt-36 md:w-5/10'>
      <h2 className='text-2xl font-bold mb-4'>My Bookings</h2>

      {
        bookings.map((item,index)=>
         <div key={index} className='flex flex-col md:flex-row justify-between bg-[var(--primary-color)]/4 border border-[var(--primary-color)]/20 rounded-1g mt-4 p-2 max-w-3x1'>
            <div className='flex flex-col md:flex-row w-full'>
              <img className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded' src={item.show.movie.poster_path} alt="" />
              <div className='flex px-4 max-md:mt-3 w-full justify-between'>
                <div className='flex flex-col justify-between'>
                  <div>
                    <h3 className='text-2xl font-bold'>{item.show.movie.title} <span className='text-sm text-gray-300 font-normal'>({item.show.movie.original_language})</span></h3>
                    <p className='text-md text-gray-500'>{Time(item.show.movie.runtime)}</p> 
                  </div>                 
                  <p className='text-md text-gray-200'>{formatDate(item.show.showDateTime)}</p>
                </div>
                <div>
                  <div className='flex flex-col justify-between h-full text-right '>
                    <div className='flex flex-col md:flex-row justify-end text-right gap-4'>
                      <h2 className='text-2xl font-bold'>{currency}{item.show.showPrice}</h2>
                    {
                      !item.isPaid ? <button className="bg-[var(--primary-color)] px-3 py-2 rounded-3xl cursor-pointer hover:bg-red-500 text-sm">Pay Now</button>:""
                    }
                    </div>
                    <p className='text-md text-gray-500'>Total Tickets : {item.bookedSeats.length}</p>
                    <p className='text-md text-gray-500'>Selected Seats : {item.bookedSeats.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
         </div>
        )
      }
      
    </div>
  ) : <Preloader/>
}

export default MyBooking
