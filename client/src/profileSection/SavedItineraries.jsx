import React, { useState, useEffect, useCallback } from 'react';
import { FaMap, FaTrash, FaClock, FaTimes, FaMapMarkerAlt, FaBed, FaUtensils, FaCamera, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Base API URL configuration with fallback
// Base API URL configuration with safe fallback
const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL }`;

const SavedItineraries = ({ userData, refreshProfile }) => {
  const itineraries = userData?.itineraries || [];
  
  // UI Modal & Interaction States
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper: Safely retrieves itinerary ID regardless of DB schema (_id vs id)
  const getItemId = (item) => item?._id || item?.id;

  // Helper: Formats ISO dates safely with fallback
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
  };

  // Close Modal Callback
  const handleCloseModal = useCallback(() => {
    setSelectedItinerary(null);
  }, []);

  // Effect: Lock body scroll & handle Escape key binding when modal is open
  useEffect(() => {
    if (selectedItinerary) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleCloseModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    document.body.style.overflow = 'unset';
  }, [selectedItinerary, handleCloseModal]);

  // Handle Itinerary Deletion
  const handleDelete = async (id) => {
    if (!id) return;
    
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;

    setDeletingId(id);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/delete-itinerary/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (data.success || res.ok) {
        if (refreshProfile) refreshProfile();
        if (selectedItinerary && getItemId(selectedItinerary) === id) {
          handleCloseModal();
        }
      } else {
        setErrorMessage(data.message || "Failed to delete itinerary.");
      }
    } catch (err) {
      console.error("Error deleting itinerary:", err);
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Icon Mapper based on activity category
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'stay': 
        return <FaBed className="text-blue-500" />;
      case 'food': 
        return <FaUtensils className="text-orange-500" />;
      case 'explore': 
        return <FaCamera className="text-emerald-500" />;
      default: 
        return <FaMapMarkerAlt className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100">
          Saved Itineraries
        </h3>

        {/* Inline Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex justify-between items-center">
            <span>{errorMessage}</span>
            <button 
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Empty State */}
        {itineraries.length === 0 ? (
          <div className="text-center py-10 sm:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
            <FaMap className="mx-auto text-3xl sm:text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm sm:text-base">No custom itineraries saved yet.</p>
            <Link 
              to="/itinerary" 
              className="inline-block mt-4 bg-emerald-50 text-[#167A44] px-5 sm:px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-100 transition focus:outline-none focus:ring-2 focus:ring-[#167A44]"
            >
              Create an Itinerary
            </Link>
          </div>
        ) : (
          /* Itineraries List */
          <div className="grid gap-4 sm:gap-5">
            {itineraries.map((it, idx) => {
              const itId = getItemId(it);
              const isDeletingThis = deletingId === itId;
              const totalActivities = it.activitiesCount ?? (it.days || []).reduce((acc, d) => acc + (d.activities?.length || 0), 0);

              return (
                <div 
                  key={itId || `itinerary-${idx}`} 
                  className="p-4 sm:p-5 border border-gray-100 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:bg-white hover:shadow-md"
                >
                  <div className="w-full min-w-0">
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                      {it.tripName || "Untitled Trip"}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-2 font-medium">
                      <FaClock className="text-gray-400 shrink-0" /> 
                      <span>Saved on: {formatDate(it.dateSaved || it.createdAt)}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-md">
                        {it.daysCount || it.days?.length || 0} Days
                      </span>
                      <span className="text-xs font-bold bg-blue-100 border border-blue-200 text-blue-800 px-2.5 py-0.5 rounded-md">
                        {totalActivities} Activities
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedItinerary(it)}
                      className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View Full Itinerary
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingThis}
                      onClick={() => handleDelete(itId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 sm:p-3 bg-white border border-gray-200 rounded-full shadow-sm transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                      title="Delete Itinerary"
                      aria-label="Delete Itinerary"
                    >
                      {isDeletingThis ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog: Full Itinerary Viewer */}
      {selectedItinerary && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3 sm:pb-4 mb-4 shrink-0">
              <div>
                <h2 id="modal-title" className="text-xl sm:text-2xl font-black text-gray-800">
                  {selectedItinerary.tripName || "Untitled Trip"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  Saved on {formatDate(selectedItinerary.dateSaved || selectedItinerary.createdAt)}
                </p>
              </div>
              <button 
                type="button"
                onClick={handleCloseModal} 
                className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Close modal"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="overflow-y-auto pr-1.5 pb-2 space-y-4 sm:space-y-6">
              {(selectedItinerary.days || []).map((day, idx) => (
                <div key={day.id || day._id || `day-${idx}`} className="bg-gray-50 p-3.5 sm:p-5 rounded-2xl border border-gray-100">
                  <h3 className="font-extrabold text-base sm:text-lg text-[#167A44] mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="bg-[#167A44] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm shrink-0 font-mono">
                      D{idx + 1}
                    </span>
                    <span>{day.title || `Day ${idx + 1}`}</span>
                  </h3>
                  
                  {/* Activity Timeline */}
                  <div className="space-y-3 pl-3 sm:pl-8 border-l-2 border-gray-200 ml-3 sm:ml-4">
                    {(day.activities || []).map((act, actIdx) => (
                      <div 
                        key={act.id || act._id || `act-${actIdx}`} 
                        className="relative flex items-center gap-3 sm:gap-4 bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 shadow-sm"
                      >
                        {/* Timeline Bullet */}
                        <div className="absolute -left-[19px] sm:-left-[39px] w-2.5 h-2.5 bg-white border-2 border-[#167A44] rounded-full" />
                        
                        <div className="font-bold text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 py-1 sm:py-1.5 rounded-lg shrink-0">
                          {act.time || "N/A"}
                        </div>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                          {getActivityIcon(act.type)}
                        </div>
                        <div className="font-semibold text-gray-800 text-xs sm:text-sm min-w-0 flex-1">
                          {act.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedItineraries;