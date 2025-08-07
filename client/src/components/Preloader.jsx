// src/components/Preloader.jsx
import { Loader2 } from 'lucide-react'; // optional, or use any spinner SVG

const Preloader = () => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-[color:var(--primary-color)] w-15 h-15 mb-4" />
        <p className="text-white text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Preloader;
