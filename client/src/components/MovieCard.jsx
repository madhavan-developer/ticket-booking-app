import { StarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Time from '../lib/TimeConvert';

const MovieCard = ({ show }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/movies/${show.id}`);
  };

  return (
    <div className='flex flex-col gap-4 bg-[#12161C] p-4 rounded-2xl text-white'>
      <img
        onClick={handleNavigate}
        src={show.backdrop_path}
        alt={show.title || "Movie Poster"}
        className='w-full h-64 object-cover rounded-lg cursor-pointer'
      />

      <h3 className='text-xl font-semibold'>{show.title}</h3>

      <p className='text-[16px] text-white/55'>
        {show.release_date?.slice(0, 4) || "N/A"} –{' '}
        {show.genres?.map((genre) => genre.name).join(", ") || "Unknown Genre"} –{' '}
        {show.runtime ? Time(show.runtime) : "Unknown Duration"}
      </p>

      <div className='flex items-center justify-between mt-2'>
        <button
          onClick={handleNavigate}
          className='px-4 py-2 text-lg bg-[var(--primary-color)] cursor-pointer rounded-full hover:bg-red-500'
        >
          Buy Ticket
        </button>
        <div className='flex items-center gap-1'>
          <StarIcon className='text-yellow-400 fill-yellow-400' />
          <span className='text-lg'>{show.vote_average?.toFixed(1) || "0.0"}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
