import React from 'react'
import { dummyDashboardData } from '../../assets/assets'
import { formatDate } from '../../lib/DateFormate'
import Title from '../../components/admin/Title'
const ListShow = () => {
  const { activeShows } = dummyDashboardData

  return (
    <div className='px-4'>
      <Title text1={'List'} text2={'Show'}/>
      <table className='w-full text-left border-separate border-spacing-y-1 mt-6'>
        <thead>
          <tr className='bg-[var(--primary-color)]/50 text-white text-[20px]'>
            <th className='p-3 rounded-l-md'>Movie Name</th>
            <th className='p-3'>Show Time</th>
            <th className='p-3'>Total Booking</th>
            <th className='p-3 rounded-r-md'>Earning</th>
          </tr>
        </thead>
        <tbody>
          {activeShows.map((show, index) => {
            const movieName = show.movie?.title || 'Unknown Movie'
            const showTime = formatDate(show.showDateTime)
            const totalBooking = Object.keys(show.occupiedSeats || {}).length
            const earning = `$${totalBooking * show.showPrice}`

            return (
              <tr key={index} className='bg-[var(--primary-color)]/20 text-white text-[16px]'>
                <td className='p-3'>{movieName}</td>
                <td className='p-3'>{showTime}</td>
                <td className='p-3'>{totalBooking}</td>
                <td className='p-3'>{earning}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ListShow
