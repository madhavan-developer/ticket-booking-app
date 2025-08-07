import { MoveRightIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MovieCard from './MovieCard';
import { dummyShowsData } from '../assets/assets';

const MoviesList = () => {

    const navigate = useNavigate();
  return (
    <div className='my-10'>
      <div className='mt-36 flex  items-center justify-between md:px-36 sm:px-4 px-2'>
        <h2 className='text-2xl font-semibold mb-4'>Now Playing</h2>
        <p onClick={()=>navigate('/movies')} className='flex items-center gap-3 cursor-pointer hover:text-[var(--primary-color)]'>View More <MoveRightIcon/></p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-36 mt-10'>
        {dummyShowsData.slice(0, 4).map((show) => (
          <MovieCard key={show.id} show={show} />
        ))}
      </div>

      <div className='flex justify-center mt-16'>
        <button onClick={()=>{navigate('/movies')}} className='px-4 py-2 text-lg bg-[var(--primary-color)] cursor-pointer rounded-lg hover:bg-red-500'>Show more</button>
      </div>
    </div>
  )
}

export default MoviesList
