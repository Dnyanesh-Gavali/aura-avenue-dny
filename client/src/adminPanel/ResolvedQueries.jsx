import React from "react";

/**
 * Resolved Queries Component
 * 
 * Description:
 * Displays an archived list of resolved customer support queries in the admin panel,
 * showing original messages, contact details, resolution status, and optional admin replies.
 * 
 * @param {Object} props
 * @param {Array} props.resolved - Array of resolved query objects.
 * 
 * @returns {React.ReactNode}
 */
export default function ResolvedQueries({ resolved = [] }) {
  return (
    <div className="space-y-4 sm:space-y-6 antialiased pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Resolved Queries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archived Support Tickets: <span className="font-semibold text-slate-700">{resolved.length}</span>
          </p>
        </div>
        {resolved.length > 0 && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Archive
          </span>
        )}
      </div>

      {/* Query Cards Stack */}
      {resolved.length === 0 ? (
        /* Empty State Card */
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl border border-slate-200/60 shadow-inner">
            📥
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">No Resolved Queries</h3>
          <p className="text-xs text-slate-400 mt-1">Resolved support tickets will appear in this history log.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resolved.map((query) => {
            const contactInfo = query.contact || query.emailOrPhone || "N/A";
            const adminResponse = query.reply || query.adminReply || query.response;
            const createdDate = query.createdAt ? new Date(query.createdAt).toLocaleString() : "N/A";

            return (
              <div
                key={query._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 p-4 sm:p-6 transition space-y-4 border-l-4 border-l-emerald-500"
              >
                {/* Header & Topic */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Resolved Ticket
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                      {query.topic || "General Inquiry"}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                    <span>✓</span> Resolved
                  </span>
                </div>

                {/* Contact & Messages Stack */}
                <div className="bg-slate-50/70 rounded-xl p-3.5 sm:p-4 border border-slate-100 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">👤 Contact:</span>
                      <span className="font-semibold text-slate-800 select-all">{contactInfo}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      <span>Created: </span>
                      <span className="text-slate-600">{createdDate}</span>
                    </div>
                  </div>

                  {/* Customer Message */}
                  <div className="pt-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Customer Message
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 whitespace-pre-line">
                      {query.message}
                    </p>
                  </div>

                  {/* Admin Reply (renders if available in object) */}
                  {adminResponse && (
                    <div className="pt-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-600 mb-1">
                        Admin Reply Sent
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 whitespace-pre-line">
                        {adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}