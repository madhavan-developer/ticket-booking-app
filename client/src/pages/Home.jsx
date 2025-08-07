import HeroSection from "../components/HeroSection"
import MoviesList from "../components/MoviesList"
import Preloader from "../components/Preloader";
import TrailerPlayer from "../components/TrailerPlayer"
import React, { useEffect, useState } from "react";

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay (e.g., API call or assets loading)
    const timer = setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
   <>
    {loading ? (
      <div className="flex items-center justify-center h-screen"><Preloader /></div>
    ) : null}
    <HeroSection />
    <MoviesList />
    <TrailerPlayer />
   </>
  )
}

export default Home
