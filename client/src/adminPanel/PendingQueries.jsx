import React, { useState } from "react";

// 📥 Reusable Error Modal Import
import ErrorModal from "../ReusableCards/ErrorModal.jsx";

/**
 * Pending Queries Component
 * 
 * Description:
 * Displays an interactive administrative list of pending customer support queries.
 * Allows admins to review customer inquiries, draft custom replies, and submit 
 * resolutions with instant error feedback and responsive loading states.
 * 
 * @param {Object} props
 * @param {Array} props.pending - List of pending support query objects.
 * @param {Function} props.solve - Async callback handler (queryId, message) to resolve a ticket.
 * 
 * @returns {React.ReactNode}
 */
export default function PendingQueries({ pending = [], solve }) {
  const [reply, setReply] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // 🔴 Error Modal State
  const [errorMsg, setErrorMsg] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setIsErrorOpen(true);
  };

  function handleReplyChange(id, value) {
    setReply((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  async function handleResolve(queryId) {
    const message = reply[queryId]?.trim();

    if (!message) {
      triggerError("Reply message cannot be empty."); // Trigger error modal if reply is empty
      return;
    }

    setLoadingId(queryId);

    // Call layout function with ID & message (Errors inside solve will be handled by AdminLayout)
    await solve(queryId, message);

    setLoadingId(null);
  }

  return (
    <div className="space-y-4 sm:space-y-6 antialiased pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Pending Queries</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unresolved Support Tickets: <span className="font-semibold text-slate-700">{pending.length}</span>
          </p>
        </div>
        {pending.length > 0 && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-semibold px-3 py-1 rounded-full shrink-0">
            Action Required
          </span>
        )}
      </div>

      {/* Query Cards Stack */}
      {pending.length === 0 ? (
        /* Empty State Card */
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl border border-emerald-100 shadow-inner">
            🎉
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">No Pending Queries</h3>
          <p className="text-xs text-slate-400 mt-1">All customer support tickets have been resolved!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((query) => {
            const isResolving = loadingId === query._id;
            const contactInfo = query.contact || query.emailOrPhone || "N/A";

            return (
              <div
                key={query._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/80 p-4 sm:p-6 transition space-y-4"
              >
                {/* Header & Topic */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Support Ticket
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mt-0.5">
                      {query.topic || "General Inquiry"}
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 self-start sm:self-center text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending
                  </span>
                </div>

                {/* Contact & Customer Query Message */}
                <div className="bg-slate-50/70 rounded-xl p-3.5 sm:p-4 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                    <span className="text-slate-400">👤 Contact:</span>
                    <span className="font-semibold text-slate-800 select-all">{contactInfo}</span>
                  </div>

                  <div className="pt-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Customer Message
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 whitespace-pre-line">
                      {query.message}
                    </p>
                  </div>
                </div>

                {/* Admin Response Box */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={`reply-${query._id}`}
                    className="block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Your Response
                  </label>
                  <textarea
                    id={`reply-${query._id}`}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-y"
                    rows={4}
                    placeholder="Write a detailed response to send to the customer..."
                    value={reply[query._id] || ""}
                    onChange={(e) => handleReplyChange(query._id, e.target.value)}
                  />
                </div>

                {/* Submit Action Button */}
                <div className="flex justify-end pt-1">
                  <button
                    disabled={isResolving}
                    onClick={() => handleResolve(query._id)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                      isResolving
                        ? "bg-emerald-400 shadow-emerald-200 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    }`}
                  >
                    {isResolving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Resolving Ticket...</span>
                      </>
                    ) : (
                      <>
                        <span>Resolve Ticket</span>
                        <span className="text-sm">✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔴 ERROR MODAL CARD */}
      <ErrorModal
        isOpen={isErrorOpen}
        message={errorMsg}
        onClose={() => setIsErrorOpen(false)}
      />
    </div>
  );
}