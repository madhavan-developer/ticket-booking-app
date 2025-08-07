import React from 'react'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <div className="px-20 py-4 flex items-center shadow-md border-b border-white/5 h-60px">
  <h1 className="text-white text-xl font-semibold">
    <img className='w-50' src={assets.logo} alt="" />
  </h1>
</div>

  )
}

export default AdminNavbar
