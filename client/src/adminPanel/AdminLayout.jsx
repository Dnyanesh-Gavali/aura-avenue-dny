import { useState, useEffect } from "react";

/**
 * Admin Layout Component
 * 
 * Description:
 * Serves as the primary structural shell for the admin portal. Manages active view state,
 * handles global admin data fetching (queries, OTP logs, packages, user verification),
 * and provides global error and success modal notifications.
 * 
 * @returns {JSX.Element} Rendered admin portal layout with navigation and views.
 */

import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import PendingQueries from "./PendingQueries";
import ResolvedQueries from "./ResolvedQueries";
import AdminOtpLogs from "./AdminOtpLogs";
import ManagePackages from "./ManagePackages";
import SendNotification from "./SendNotification";

// 📥 Reusable Modal Cards Import
import ErrorModal from "../ReusableCards/ErrorModal.jsx";
import SuccessModal from "../ReusableCards/SuccessModal.jsx";

function AdminLayout() {
  // Navigation State
  const [activePage, setActivePage] = useState("dashboard");

  // Admin Data States
  const [pendingQueries, setPendingQueries] = useState([]);
  const [resolvedQueries, setResolvedQueries] = useState([]);
  const [otpLogs, setOtpLogs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔴 🟢 Global Modal States
  const [errorMsg, setErrorMsg] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Helper trigger to display error modal
  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsErrorOpen(true);
  };

  // Helper trigger to display success modal
  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsSuccessOpen(true);
  };

  // Initial Data Load on Mount
  useEffect(() => {
    fetchPendingQueries();
    fetchResolvedQueries();
    checkCurrentUser();
    fetchAdminOtpLogs();
    fetchPackages();
  }, []);

  /** Verifies session token and retrieves current admin user information */
  async function checkCurrentUser() {
    try {
      // const response = await fetch("http://localhost:5000/auth/verify-token", {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-token`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser({ email: data.email, role: data.role });
      }
    } catch (err) {
      console.error(err);
    }
  }

  /** Fetches list of all pending customer inquiries */
  async function fetchPendingQueries() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/pending-queries`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPendingQueries(data.queries ?? []);
      } else {
        triggerError(data.message || "Failed to fetch pending queries.");
      }
    } catch (err) {
      console.error("Error fetching pending queries:", err);
      triggerError("Server error while fetching pending queries.");
    }
  }

  /** Fetches list of all resolved customer inquiries */
  async function fetchResolvedQueries() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/resolved-queries`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setResolvedQueries(data.queries ?? []);
      } else {
        triggerError(data.message || "Failed to fetch resolved queries.");
      }
    } catch (err) {
      console.error("Error fetching resolved queries:", err);
      triggerError("Server error while fetching resolved queries.");
    }
  }

  /** Fetches system OTP audit logs */
  async function fetchAdminOtpLogs() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/admin-otp`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setOtpLogs(data.otpLogs ?? []);
      } else {
        triggerError(data.message || "Failed to fetch OTP logs.");
      }
    } catch (err) {
      console.error("Error fetching OTP logs:", err);
      triggerError("Server error while fetching OTP logs.");
    }
  }

  /** Fetches all available service/product packages */
  async function fetchPackages() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/get-all-packages`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages ?? []);
      } else {
        triggerError(data.message || "Failed to fetch packages.");
      }
    } catch (err) {
      console.error("Error fetching packages:", err);
      triggerError("Server error while fetching packages.");
    }
  }

  /** Handles resolving a pending query and refreshes relevant data views */
  async function handleQueryResolved(queryId, message) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/admin/resolve-query`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: queryId,
          message: message,
          resolvedBy: currentUser?.email,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchPendingQueries();
        await fetchResolvedQueries();
        setActivePage("dashboard");
        triggerSuccess(data.message || "Query resolved successfully!");
      } else {
        triggerError(data.message || "Failed to resolve query.");
        setActivePage("dashboard");
      }
    } catch (err) {
      console.error(err);
      triggerError(err.message || "Server connection failed.");
      setActivePage("dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Main Responsive Flex Layout Container */}
      <div className="flex flex-col md:flex-row flex-1 w-full min-h-0 overflow-x-hidden">
        
        {/* Navigation Sidebar */}
        <AdminSidebar activePage={activePage} setActivePage={setActivePage} />

        {/* Primary Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 transition-all duration-200">
          {activePage === "dashboard" && (
            <AdminDashboard
              pendingCount={pendingQueries.length}
              resolvedCount={resolvedQueries.length}
              totalCount={pendingQueries.length + resolvedQueries.length}
            />
          )}

          {activePage === "pending" && (
            <PendingQueries
              pending={pendingQueries}
              solve={handleQueryResolved}
            />
          )}

          {activePage === "resolved" && (
            <ResolvedQueries resolved={resolvedQueries} />
          )}

          {activePage === "admin-otps" && (
            <AdminOtpLogs logs={otpLogs} refreshLogs={fetchAdminOtpLogs} />
          )}

          {activePage === "packages" && (
            <ManagePackages
              packages={packages}
              onRefresh={fetchPackages}
              triggerSuccess={triggerSuccess}
              triggerError={triggerError}
            />
          )}

          {/* Render Send Notification View */}
          {activePage === "notifications" && (
            <SendNotification
              triggerSuccess={triggerSuccess}
              triggerError={triggerError}
            />
          )}
        </main>
      </div>

      {/* 🔴 ERROR MODAL CARD */}
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMsg}
        onClose={() => setIsErrorOpen(false)}
      />

      {/* 🟢 SUCCESS MODAL CARD */}
      <SuccessModal
        isOpen={isSuccessOpen}
        message={successMsg}
        onClose={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}

export default AdminLayout;