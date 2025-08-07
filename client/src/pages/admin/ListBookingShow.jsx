import React from 'react'
import { dummyBookingData } from '../../assets/assets'
import { formatDate } from '../../lib/DateFormate'
import Title from '../../components/admin/Title'

const ListBookingShow = () => {

  return (
    <div className='px-4'>
      <Title text1={'List'} text2={'Bookings'}/>
      <table className='w-full text-left border-separate border-spacing-y-2 mt-6'>
        <thead>
          <tr className='bg-[var(--primary-color)]/50 text-white text-[20px]'>
            <th className='p-3 rounded-l-md'>User Name</th>
            <th className='p-3'>Movie Name</th>
            <th className='p-3'>Show Time</th>
            <th className='p-3'>Seats</th>
            <th className='p-3 rounded-r-md'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {dummyBookingData.map((booking, index) => (
            <tr key={index} className='bg-[var(--primary-color)]/20 text-white text-[16px]'>
              <td className='p-3'>{booking.user.name}</td>
              <td className='p-3'>{booking.show.movie.title || 'N/A'}</td>
              <td className='p-3'>{formatDate(booking.show.showDateTime)}</td>
              <td className='p-3'>{booking.bookedSeats.join(', ')}</td>
              <td className='p-3'>${booking.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ListBookingShow
