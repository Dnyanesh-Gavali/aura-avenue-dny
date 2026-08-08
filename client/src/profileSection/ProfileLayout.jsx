import React, { useState, useEffect, useCallback } from "react";
import ProfileSidebar from "./ProfileSidebar";
import EditProfile from "./EditProfile";
import ProfileOverview from "./ProfileOverview";
import ChangePassword from "./ChangePassword";
import MyBookings from "./MyBookings.jsx";
import SavedItineraries from "./SavedItineraries.jsx";
import FavoritePackages from "./FavoritePackages.jsx";
import ProfileNotifications from "./ProfileNotifications.jsx";
import ErrorModal from "../ReusableCards/ErrorModal.jsx";
import SuccessModal from "../ReusableCards/SuccessModal.jsx";
import ScrollToTop from "../components/DestinationDetailPageComponents/ScrollToTop.jsx";

// =======================================================
// BACKEND CONFIGURATION / ENDPOINTS
// =======================================================
const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}`;

const API_ROUTES = {
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify-token`,
  GET_USER_DATA: `${API_BASE_URL}/auth/get-user-data`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/update-profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  GET_NOTIFICATIONS: `${API_BASE_URL}/notifications/get-all`,
  MARK_READ: `${API_BASE_URL}/notifications/mark-read`,
};

// =======================================================
// MAIN PROFILE LAYOUT COMPONENT
// =======================================================
const ProfileLayout = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Modals State
  const [errorMsg, setErrorMsg] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Helper Feedback Triggers
  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsErrorOpen(true);
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsSuccessOpen(true);
  };

  // Fetch all user notifications
  const fetchAllNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch(API_ROUTES.GET_NOTIFICATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Main fetch routine for User Profile
  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const authResponse = await fetch(API_ROUTES.VERIFY_TOKEN, {
        method: "POST",
        credentials: "include",
      });
      const authData = await authResponse.json();

      if (!authData.success || !authData.email) {
        triggerError(authData.message || "Session expired. Please log in.");
        setUserData(null);
        return;
      }

      const userResponse = await fetch(API_ROUTES.GET_USER_DATA, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authData.email }),
      });
      const userResult = await userResponse.json();

      if (userResult.success) {
        setUserData(userResult.user ?? null);
        fetchAllNotifications();
      } else {
        triggerError(userResult.message || "Failed to fetch user data.");
        setUserData(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      triggerError("Server error while fetching profile.");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAllNotifications]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Mark all unread notifications as read
  const handleMarkAsRead = async () => {
    if (!userData?.email) return;
    try {
      const res = await fetch(API_ROUTES.MARK_READ, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: userData.email }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update local state to reflect read status
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
      }
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  // Handler for Updating Profile Details
  async function handleUpdateProfile(updatedFormData) {
    try {
      const response = await fetch(API_ROUTES.UPDATE_PROFILE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: userData?.email,
          ...updatedFormData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        triggerSuccess(data.message || "Profile updated successfully!");
        await fetchUserProfile();
        setActiveTab("overview");
      } else {
        triggerError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      triggerError("Server connection error while updating profile.");
    }
  }

  // Handler for Changing Password
  async function handleChangePassword(passwordData) {
    try {
      const response = await fetch(API_ROUTES.CHANGE_PASSWORD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: userData?.email,
          ...passwordData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        triggerSuccess(data.message || "Password changed successfully!");
        setActiveTab("overview");
      } else {
        triggerError(data.message || "Failed to change password.");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      triggerError("Server connection error while changing password.");
    }
  }

  // Render content dynamically based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
          Loading profile...
        </div>
      );
    }

    if (!userData) {
      return (
        <div className="flex justify-center items-center h-64 text-red-500 font-medium">
          Unable to load profile data.
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return <ProfileOverview userData={userData} setActiveTab={setActiveTab} />;
      case "bookings":
        return <MyBookings userData={userData} />;
      case "itineraries":
        return <SavedItineraries userData={userData} refreshProfile={fetchUserProfile} />;
      case "favorites":
        return <FavoritePackages userData={userData} refreshProfile={fetchUserProfile} />;
      case "notifications":
        return (
          <ProfileNotifications
            notifications={notifications}
            loading={notificationsLoading}
            onMarkAsRead={handleMarkAsRead}
            refreshNotifications={fetchAllNotifications}
          />
        );
      case "edit":
        return (
          <EditProfile
            userData={userData}
            onSave={handleUpdateProfile}
            triggerSuccess={triggerSuccess}
            triggerError={triggerError}
            setActiveTab={setActiveTab}
          />
        );
      case "security":
        return (
          <ChangePassword
            userData={userData}
            onSave={handleChangePassword}
            triggerSuccess={triggerSuccess}
            triggerError={triggerError}
            setActiveTab={setActiveTab}
          />
        );
      default:
        return <ProfileOverview userData={userData} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-[calc(100vh-64px)] w-full">
      <ScrollToTop />
      
      {/* Sidebar Navigation */}
      <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} userData={userData} />
      
      {/* Dynamic Content Panel */}
      <main className="flex-1 p-4 md:p-8 w-full min-w-0 overflow-y-auto">
        {renderTabContent()}
      </main>

      {/* ERROR MODAL */}
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMsg}
        onClose={() => setIsErrorOpen(false)}
      />

      {/* SUCCESS MODAL */}
      <SuccessModal
        isOpen={isSuccessOpen}
        message={successMsg}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
};

export default ProfileLayout;