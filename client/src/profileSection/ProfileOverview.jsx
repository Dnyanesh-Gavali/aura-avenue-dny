import React from 'react';

// Component: ProfileOverview
// Purpose: Displays essential user profile details, avatar initial, role badge, and edit action links.
const ProfileOverview = ({ userData, setActiveTab }) => {
  if (!userData) return null;

  // Extract user details with safe fallbacks
  const name = userData.name || userData.fullName || "User";
  const email = userData.email || "N/A";
  const phone = userData.phone || "N/A";
  const role = userData.role ? userData.role.toUpperCase() : "USER";

  // Helper: Derives first character for avatar initial
  const getInitial = () => {
    return name ? name.trim()[0].toUpperCase() : 'U';
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 box-border">
      {/* Header Banner Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 box-border">
        <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 w-full sm:w-auto">
          {/* Avatar Initial Badge */}
          <div 
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#167A44] text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-md shrink-0 select-none"
            aria-hidden="true"
          >
            {getInitial()}
          </div>

          {/* Basic Profile Identifiers */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-full" title={name}>
                {name}
              </h2>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md shrink-0 ${
                role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5" title={email}>
              {email}
            </p>
          </div>
        </div>

        {/* Quick Action: Edit Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className="text-xs sm:text-sm bg-emerald-50 text-[#167A44] px-3.5 sm:px-4 py-2 rounded-lg font-semibold hover:bg-emerald-100 transition-colors duration-200 ease-in-out self-stretch sm:self-auto flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#167A44]"
        >
          <span>Edit Profile</span>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Details Card */}
      <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm box-border">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6">
          {/* Full Name */}
          <div className="p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Full Name
            </span>
            <span className="text-gray-800 font-semibold text-sm sm:text-base break-words block">
              {name}
            </span>
          </div>

          {/* Email Address */}
          <div className="p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Email Address
            </span>
            <span className="text-gray-800 font-semibold text-sm sm:text-base break-words block">
              {email}
            </span>
          </div>

          {/* Phone Number */}
          <div className="p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Phone Number
            </span>
            <span className="text-gray-800 font-semibold text-sm sm:text-base break-words block">
              {phone}
            </span>
          </div>

          {/* Account Status */}
          <div className="p-3.5 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Account Status
            </span>
            <div>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 sm:px-3 py-1 rounded-full font-bold inline-block">
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;