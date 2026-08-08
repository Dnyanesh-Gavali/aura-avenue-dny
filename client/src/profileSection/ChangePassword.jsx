import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 

// Component: ChangePassword
// Purpose: Renders the security form allowing users to update their password.
const ChangePassword = ({ userData, triggerSuccess, triggerError, setActiveTab }) => {
  // State: Manages the input values for the password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State: Manages the disabled/loading state of the submit button during API calls
  const [loading, setLoading] = useState(false);

  // Logic: Handles the API request to change the password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      triggerError("New passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: userData?.email,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const result = await res.json();

      if (result.success) {
        triggerSuccess("Password changed successfully!");
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('overview');
      } else {
        triggerError(result.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Change password error:", err);
      triggerError("Server error occurred while updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Main Container: Responsive padding (p-4 mobile, p-6 desktop), max-width constraints, and box-sizing to prevent overflow
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm w-full max-w-lg mx-auto box-border">
      
      {/* Header Section */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Security & Password</h2>
      <p className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">Update your password to keep your account safe.</p>

      {/* Form Section: Uses space-y to keep consistent vertical gaps between fields */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 w-full">
        
        {/* FIELD: Current Password */}
        <div className="w-full">
          {/* Label Container: flex-wrap ensures the link and label don't merge on ultra-narrow screens */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase">
              Current Password
            </label>
            {/* LINK: Forgot Password */}
            <Link
              to="/forgotpassword"
              className="text-xs text-[#167A44] font-medium hover:underline focus:outline-none"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={passwords.currentPassword}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
        </div>

        {/* FIELD: New Password */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            New Password
          </label>
          <input
            type="password"
            required
            value={passwords.newPassword}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
        </div>

        {/* FIELD: Confirm New Password */}
        <div className="w-full">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={passwords.confirmPassword}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:bg-white focus:border-[#167A44] transition-colors duration-200 ease-in-out box-border"
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
        </div>

        {/* ACTION: Submit Button Container */}
        <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row justify-end gap-3 w-full">
          <button
            type="submit"
            disabled={loading}
            /* w-full on mobile for easy tapping, sm:w-auto on larger screens for neat alignment */
            className="w-full sm:w-auto bg-[#167A44] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#125E36] transition-colors duration-200 ease-in-out shadow-sm text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#167A44] focus:ring-offset-1"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;