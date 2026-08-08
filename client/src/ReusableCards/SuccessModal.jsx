import React, { useEffect, useCallback } from 'react';

/**
 * Reusable Success Notification Modal
 * 
 * @param {boolean} isOpen - Control visibility of the modal
 * @param {string} title - Optional title header (defaults to "Success!")
 * @param {string} message - Custom message to display
 * @param {string} buttonText - Action button label (defaults to "Continue")
 * @param {function} onClose - Action triggered on close or button click
 */
const SuccessModal = ({ 
  isOpen, 
  title = "Success!", 
  message = "Action completed successfully.", 
  buttonText = "Continue", 
  onClose 
}) => {

  // Close handler memoized for event listeners
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  // Lock body scroll and listen for Escape key press
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleClose();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    document.body.style.overflow = 'unset';
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
    >
      <div 
        className="w-full max-w-[380px] bg-white p-6 sm:p-7 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon Badge */}
        <div 
          className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-[#167A44] rounded-full flex justify-center items-center mb-4 shadow-sm shrink-0"
          aria-hidden="true"
        >
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2.5" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 id="success-modal-title" className="text-xl font-extrabold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Success Message */}
        <p id="success-modal-description" className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full bg-[#167A44] hover:bg-[#115e34] text-white rounded-xl py-3 px-6 text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#167A44] focus:ring-offset-2"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;