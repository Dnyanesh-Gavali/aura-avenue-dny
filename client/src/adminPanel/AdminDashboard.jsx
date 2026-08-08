import React from "react";

/**
 * AdminDashboard Component
 * 
 * Description:
 * Displays key administrative metrics (Pending, Resolved, and Total support inquiries)
 * using visual status cards with distinct color coding and responsive layouts.
 * 
 * @param {Object} props
 * @param {number} props.pendingCount - Number of currently pending customer queries.
 * @param {number} props.resolvedCount - Number of resolved customer queries.
 * @param {number} [props.totalCount] - Total number of queries (defaults to sum of pending and resolved if omitted).
 * 
 * @returns {JSX.Element} Rendered admin metric overview panel.
 */
function AdminDashboard({ pendingCount, resolvedCount, totalCount }) {
  // Array defining the metric properties, colors, icons, and values for the dashboard cards.
  const metrics = [
    {
      title: "Pending Queries",
      value: pendingCount,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-200",
      accent: "bg-amber-500",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Resolved Queries",
      value: resolvedCount,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-200",
      accent: "bg-emerald-500",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      title: "Total Queries",
      // Fallback logic: Uses provided totalCount, otherwise calculates (pendingCount + resolvedCount)
      value: totalCount ?? pendingCount + resolvedCount,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-200",
      accent: "bg-indigo-500",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Overview of customer inquiries and support status.
        </p>
      </div>

      {/* Responsive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-0"
          >
            {/* Top Colored Accent Stripe */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${m.accent}`} />
            
            {/* Card Top: Title & Icon Container */}
            <div className="flex items-center justify-between mb-4 gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">{m.title}</span>
              <div className={`p-2 sm:p-2.5 rounded-xl ${m.bgColor} shrink-0`}>
                {m.icon}
              </div>
            </div>

            {/* Card Bottom: Metric Numeric Count & Unit */}
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className={`text-3xl sm:text-4xl font-extrabold ${m.color} truncate max-w-full`}>
                {m.value}
              </span>
              <span className="text-xs text-gray-400 font-medium shrink-0">tickets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;