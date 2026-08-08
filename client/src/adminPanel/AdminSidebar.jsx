import React from 'react';

/**
 * Admin Sidebar Component
 * 
 * Description:
 * Provides navigation links for the admin panel, allowing users to switch between
 * Dashboard, Pending Queries, Resolved Queries, Admin OTP Logs, Manage Packages, and Send Notifications.
 * Dynamically switches between a desktop sidebar and a touch-friendly mobile navigation bar.
 * 
 * @param {Object} props
 * @param {string} props.activePage - The currently active view tab identifier.
 * @param {function} props.setActivePage - Callback function to update the active page state.
 * 
 * @returns {JSX.Element} Rendered admin navigation sidebar / header.
 */
function AdminSidebar({ activePage, setActivePage }) {
  // Navigation menu items configuration
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "pending",
      label: "Pending Queries",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "resolved",
      label: "Resolved Queries",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "admin-otps",
      label: "Admin OTP Logs",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      id: "packages",
      label: "Manage Packages",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Send Notifications",
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 md:min-h-screen p-3 sm:p-4 flex flex-col justify-between shrink-0">
      <div className="w-full">
        {/* Navigation Category Label (Hidden on small mobile screens to conserve height) */}
        <div className="hidden md:block px-4 py-3 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Main Menu</span>
        </div>

        {/* Navigation Items (Scrollable horizontally on mobile, stacked vertically on desktop) */}
        <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shrink-0 md:w-full ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm border border-emerald-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className={isActive ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info Card (Desktop Only) */}
      <div className="hidden md:block p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 mt-6">
        <p className="font-semibold text-gray-700 mb-0.5">AuraAvenue Portal</p>
        <p>Admin Operations v1.0</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;