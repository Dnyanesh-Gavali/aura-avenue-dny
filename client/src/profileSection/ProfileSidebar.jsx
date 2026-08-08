import React from 'react';

// Component: ProfileSidebar
// Purpose: Provides responsive tab navigation (horizontal bar on mobile, vertical sidebar on desktop) for the user profile dashboard.
const ProfileSidebar = ({ activeTab, setActiveTab, userData, unreadCount = 0 }) => {
  // Definition of profile navigation items
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊' },
    { id: 'bookings', label: 'My Bookings', icon: '✈️' },
    { id: 'itineraries', label: 'Saved Itineraries', icon: '🗺️' },
    { id: 'favorites', label: 'Favorite Packages', icon: '❤️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
    { id: 'edit', label: 'Edit Profile', icon: '✏️' },
    { id: 'security', label: 'Security & Password', icon: '🔒' },
  ];

  // User details with safe fallbacks
  const name = userData?.name || userData?.fullName || 'User';
  const email = userData?.email || 'user@domain.com';

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between p-3 sm:p-4 shrink-0 box-border">
      <div className="w-full">
        {/* Sidebar Header Category - Desktop Only */}
        <p className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
          Profile Menu
        </p>

        {/* Navigation Item Bar: Horizontally scrollable on Mobile, Vertical Stack on Desktop */}
        <nav
          aria-label="Profile section navigation"
          className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors duration-150 ease-out shrink-0 md:shrink select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#167A44] active:scale-[0.98] border-b-2 md:border-b-0 md:border-l-4 ${isActive
                    ? 'bg-emerald-50/80 text-[#167A44] font-bold border-[#167A44] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-sm sm:text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>

                {/* Notification Unread Counter Badge */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info Widget - Desktop Only */}
      <div className="hidden md:block border-t border-gray-100 pt-4 mt-6">
        <div className="px-2">
          <p className="text-xs font-bold text-gray-800 truncate" title={name}>
            {name}
          </p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5" title={email}>
            {email}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;