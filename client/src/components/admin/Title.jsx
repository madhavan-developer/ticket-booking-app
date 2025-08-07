import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div>
      <h2 className='text-3xl font-bold'>{text1} <span className='text-[var(--primary-color)] underline'>{text2}</span></h2>
    </div>
  )
}

export default Title
