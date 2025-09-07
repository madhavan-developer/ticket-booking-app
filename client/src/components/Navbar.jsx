import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Search, MenuIcon, XIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { app } from "../lib/firebase";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth User:", user);
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full text-white flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md" : "bg-transparent"
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
      <div className="flex items-center gap-4 relative">
        <Search className="w-5 h-5 text-white cursor-pointer" />

        {!user ? (
          <button
            onClick={handleGoogleSignIn}
            className="bg-[#ff3e57] text-white px-5 py-2 rounded-full font-medium text-sm cursor-pointer"
          >
            Login
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <img
              src={
                user?.photoURL
                  ? user.photoURL
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.displayName || "User"
                    )}`
              }
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-500 object-cover"
              referrerPolicy="no-referrer"
              onClick={() => setDropdownOpen((prev) => !prev)}
            />

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    navigate("/mybookings");
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
