import { Calendar1Icon, Clock1Icon, MoveRightIcon } from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const navigate = useNavigate();


  return (
    <div className="px-4 flex flex-col items-start justify-center md:px-36  bg-[url('/backgroundImage.png')] bg-cover bg-center h-screen">
      <img src={assets.marvelLogo} alt="" />
      <h1 className="text-5xl md:leading-18 md:text-[70px] font-bold">
        Gurdiance <br />
        of The Galaxy
      </h1>
      <div className="flex gap-5 text-lg mt-3">
        <p>Action | Adventure | Sci-Fi</p>
        <p className="flex gap-2"><Calendar1Icon/>2018</p>
        <p className="flex gap-2"><Clock1Icon/>2h 8m</p>
      </div>
      <p className="mt-4 text-lg md:w-2xl">In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.</p>
      <button onClick={()=>navigate('/movies')} className="flex gap-4 bg-[var(--primary-color)] px-6 py-4 rounded-full mt-4 cursor-pointer transition transform-3d hover:bg-red-500">Explore More<MoveRightIcon/></button>
    </div>
  );
};

export default HeroSection;
