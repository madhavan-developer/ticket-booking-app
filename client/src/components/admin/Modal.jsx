import React from "react";
import { X } from "lucide-react";

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1f1f1f] rounded-lg shadow-lg w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
