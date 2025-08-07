import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Search, MenuIcon, XIcon, TicketPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full text-white flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold">
        <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
      </Link>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-6 bg-[#0000004f] px-10 py-5 rounded-full text-sm backdrop:blur-[50px] border">
        <Link to="/" className="hover:text-white text-gray-300">
          Home
        </Link>
        <Link to="/movies" className="hover:text-white text-gray-300">
          Movies
        </Link>
        <Link to="#" className="hover:text-white text-gray-300">
          Theaters
        </Link>
        <Link to="#" className="hover:text-white text-gray-300">
          Releases
        </Link>
        <Link to="/favorite" className="hover:text-white text-gray-300">
          Favorites
        </Link>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        <Search className="w-5 h-5 text-white cursor-pointer" />
        {!user ? (
          <button
            onClick={openSignIn}
            className="bg-[#ff3e57] text-white px-5 py-2 rounded-full font-medium text-sm cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width="15px" />}
                onClick={() => navigate('/mybookings')}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* Mobile Menu Toggle Button */}
        <MenuIcon
          onClick={() => setIsOpen(true)}
          className="md:hidden w-7 h-7 text-white cursor-pointer"
        />
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/90 flex flex-col items-center justify-center z-50 gap-8 text-lg font-medium">
          <XIcon
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 w-6 h-6 text-white cursor-pointer"
          />
          <Link to="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/movies" onClick={() => setIsOpen(false)}>
            Movies
          </Link>
          <Link to="#" onClick={() => setIsOpen(false)}>
            Theaters
          </Link>
          <Link to="#" onClick={() => setIsOpen(false)}>
            Releases
          </Link>
          <Link to="/favorite" onClick={() => setIsOpen(false)}>
            Favorites
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;
