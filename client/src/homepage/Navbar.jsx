import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Destinations", to: "/destinations" },
  { label: "Itinerary", to: "/itinerary" },
  { label: "Packages", to: "/packages" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const fetchNotifications = async (email) => {
    if (!email) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/notifications/unread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.email || notifications.length === 0) return;
    setNotifications([]);
    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/notifications/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: currentUser.email, notificationIds: [] }),
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // --- UPDATED NOTIFICATION CLICK HANDLER ---
  const handleNotificationClick = (link) => {
    setNotifDropdownOpen(false);

    // Check if link exists and has a length greater than 0
    if (typeof link === "string" && link.trim().length > 0) {
      const targetLink = link.trim();

      // If external URL (starts with http:// or https://)
      if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
        window.location.href = targetLink;
      } else {
        // Internal route navigation
        navigate(targetLink);
      }
    } else {
      // If link size is 0 (or null/undefined), navigate to /profile
      navigate("/profile");
    }
  };

  const checkCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser({
          email: data.email,
          name: data.name || "",
          role: data.role,
        });
        fetchNotifications(data.email);
      } else {
        setCurrentUser(null);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error checking current user:", error);
      setCurrentUser(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitial = () => {
    if (currentUser?.name && currentUser.name.trim().length > 0) {
      return currentUser.name.trim()[0].toUpperCase();
    }
    if (currentUser?.email && currentUser.email.trim().length > 0) {
      return currentUser.email.trim()[0].toUpperCase();
    }
    return "U";
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(null);
        setProfileDropdownOpen(false);
        setNotifDropdownOpen(false);
        setNotifications([]);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navRight = () => {
    if (currentUser?.email) {
      return (
        <div className="flex items-center gap-3">
          {/* NOTIFICATION BELL */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setNotifDropdownOpen((prev) => !prev);
                setProfileDropdownOpen(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-xs transition hover:border-emerald-500 hover:text-[#167A44] focus:outline-none"
              aria-label="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>

              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {notifDropdownOpen && (
              <div className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:top-auto sm:right-0 sm:mt-3 w-auto sm:w-96 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl z-50">
                {/* Header Section */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                    {notifications.length > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-[#167A44]">
                        {notifications.length} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchNotifications(currentUser?.email)}
                      className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      🔄 Refresh
                    </button>

                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-bold text-[#167A44] bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1 rounded-md"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif.link)}
                        className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-800">{notif.title}</p>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Action */}
                <div className="border-t border-gray-100 pt-2 text-center">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-center py-1.5 text-xs font-bold text-[#167A44] hover:bg-emerald-50 rounded-lg transition"
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE BUTTON */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => {
                setProfileDropdownOpen((prev) => !prev);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 shadow-2xs hover:border-gray-300 focus:outline-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#167A44] text-xs font-bold text-white">
                {getInitial()}
              </div>
              <span className="hidden max-w-[100px] truncate text-xs font-bold text-gray-700 sm:block">
                {currentUser.name ? currentUser.name.split(" ")[0] : "User"}
              </span>
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl z-50">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name || "User"}</p>
                  <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#167A44] rounded-xl"
                  >
                    👤 My Profile
                  </Link>
                  {currentUser.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#167A44] rounded-xl"
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-xs font-semibold text-gray-700 hover:text-[#167A44]">
          Log in
        </Link>
        <Link to="/signup" className="rounded-full bg-[#167A44] px-5 py-2 text-xs font-bold text-white hover:bg-[#125E36]">
          Sign up
        </Link>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-extrabold text-[#14201A]">
          AuraAvenue
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-[#167A44] ${pathname === link.to ? "text-[#167A44] font-bold" : "text-gray-600"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">{navRight()}</div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-full bg-[#167A44] px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          {menuOpen ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          Menu
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 bg-gray-50 px-6 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">{navRight()}</div>
        </nav>
      )}
    </header>
  );
}