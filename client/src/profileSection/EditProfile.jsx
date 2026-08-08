import React, { useState, useEffect } from 'react';

// Component: EditProfile
// Purpose: Allows users to update their profile information (name, phone, address) while keeping sensitive fields (email) read-only.
const EditProfile = ({ userData, refreshProfile, triggerSuccess, triggerError, setActiveTab }) => {
  // State: Holds form input values pre-populated from user profile data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    city: 'Surat',
    postalCode: '395007'
  });

  // State: Handles loading state during profile update API request
  const [loading, setLoading] = useState(false);

  // Sync state whenever userData prop updates or component mounts
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        country: userData.country || 'India',
        city: userData.city || 'Surat',
        postalCode: userData.postalCode || '395007'
      });
    }
  }, [userData]);

  // Utility: Returns the first initial of the user's name for the profile avatar badge
  const getInitial = () => {
    return formData.name && formData.name.trim().length > 0
      ? formData.name.trim()[0].toUpperCase()
      : 'U';
  };

  // Handler: Updates form state fields dynamically on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Logic: Submits updated profile information to backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        triggerSuccess(result.message || "Profile updated successfully!");
        if (refreshProfile) refreshProfile();
        setActiveTab('overview');
      } else {
        triggerError(result.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      triggerError("Server communication error while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 box-border">
      
      {/* SECTION 1: Profile Header Card */}
      {/* Flex direction shifts to column on tiny mobile screens to avoid text squeezing against the avatar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-5 box-border">
        {/* User Avatar Circle */}
        <div className="w-16 h-16 rounded-full bg-[#167A44] text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
          {getInitial()}
        </div>
        {/* User Information Summary */}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {formData.name || 'User Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {formData.city}, {formData.country}
          </p>
        </div>
      </div>

      {/* SECTION 2: Profile Edit Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6 w-full">
        
        {/* Personal Information Group */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm box-border">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input: Full Name */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
              />
            </div>

            {/* Input: Email Address (Read Only) */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed box-border select-none"
              />
            </div>

            {/* Input: Phone Number */}
            <div className="w-full md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
              />
            </div>
          </div>
        </div>

        {/* Address Information Group */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm box-border">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6 border-b pb-3 border-gray-100">
            Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Input: Country */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
              />
            </div>

            {/* Input: City */}
            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
              />
            </div>

            {/* Input: Postal Code */}
            <div className="w-full sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Action Buttons */}
        {/* Reversed column orientation on mobile ensures 'Save Changes' is prominent on mobile devices */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors duration-200 ease-in-out text-sm text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#167A44] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#125E36] transition-colors duration-200 ease-in-out shadow-sm text-sm disabled:opacity-50 text-center focus:outline-none focus:ring-2 focus:ring-[#167A44] focus:ring-offset-1"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProfile;