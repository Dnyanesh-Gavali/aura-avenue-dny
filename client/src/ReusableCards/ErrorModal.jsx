import React, { useEffect, useCallback } from 'react';

/**
 * Reusable Error Notification Modal
 * 
 * @param {boolean} isOpen - Control visibility of the modal
 * @param {string} title - Optional title header (defaults to "Failed!")
 * @param {string} message - Custom error message to display
 * @param {string} buttonText - Action button label (defaults to "Try Again")
 * @param {function} onClose - Action triggered on close or button click
 */
const ErrorModal = ({ 
  isOpen, 
  title = "Failed!", 
  message = "Something went wrong. Please try again.", 
  buttonText = "Try Again", 
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
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
    >
      <div 
        className="w-full max-w-[380px] bg-white p-6 sm:p-7 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Error Icon Badge */}
        <div 
          className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex justify-center items-center mb-4 shadow-sm shrink-0"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Modal Title */}
        <h3 id="error-modal-title" className="text-xl font-extrabold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Error Message */}
        <p id="error-modal-description" className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-6 text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;