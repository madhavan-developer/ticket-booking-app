import React, { useState } from "react";
import ReactPlayer from "react-player";
import { dummyTrailers } from "../assets/assets";
import { PlayCircle } from "lucide-react";

const TrailerPlayer = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="px-4 md:px-36 sm:px-2 mt-36">
      <h2 className="text-2xl font-semibold mb-4">Trailers</h2>

      <div className="flex justify-center mb-6">
        <div className="w-[950px] h-[500px] rounded-lg shadow-lg overflow-hidden">
          <ReactPlayer
            src={currentTrailer.videoUrl}
            controls={false}
            width="100%"
            height="100%"
          />
        </div>
      </div>
      <div className="px-6 md:px-36 sm:w-[100%] max-md:w-[100%] grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mx-auto mt-16">
        {dummyTrailers.map((trailer, index) => (
          <div
            key={index}
            className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-auto md:max-h-auto cursor-pointer"
            onClick={() => setCurrentTrailer(trailer)}
          >
            <div className="w-full md:h-36 rounded-lg overflow-hidden relative ">
              <img
                src={trailer.image}
                alt="trailer"
                className="w-full h-full object-cover"
              />
              <PlayCircle className="absolute inset-0 m-auto w-12 h-12 text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerPlayer;
