import React, { useState } from "react";

/**
 * Send Notification Component
 * 
 * Description:
 * Allows administrators to broadcast in-app notifications and email updates to all 
 * registered platform users with configurable notification types and dynamic links.
 * 
 * @param {Object} props
 * @param {Function} props.triggerSuccess - Callback to display success toasts/modals.
 * @param {Function} props.triggerError - Callback to display error toasts/modals.
 * 
 * @returns {React.ReactNode}
 */
export default function SendNotification({ triggerSuccess, triggerError }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    link: "",
    sendEmailFlag: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      triggerError("Title and Message cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/notifications/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        triggerSuccess(data.message || "Notification sent to all users!");
        // Reset Form
        setFormData({
          title: "",
          message: "",
          type: "SYSTEM",
          link: "",
          sendEmailFlag: true,
        });
      } else {
        triggerError(data.message || "Failed to broadcast notification.");
      }
    } catch (err) {
      console.error(err);
      triggerError("Server connection failed. Could not send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 antialiased pb-10 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            Broadcast Notification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch in-app updates and emails directly to all registered users.
          </p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Broadcast Center
        </span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              Notification Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 🌴 New Kerala Backwaters Package Added!"
              className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Type & Link Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notification Type Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Notification Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-slate-700"
              >
                <option value="SYSTEM">⚡ SYSTEM (Notice / Update)</option>
                <option value="PACKAGE_ADD">🏖️ PACKAGE_ADD (New Package)</option>
                <option value="OFFER">🏷️ OFFER (Discount / Promo)</option>
              </select>
            </div>

            {/* Redirect Link Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Redirect Link <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                placeholder="e.g. /packages"
                className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
              Message Payload <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write a clear, detailed message to send to your users..."
              className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-y"
            />
          </div>

          {/* Email Checkbox Toggle Card */}
          <label
            htmlFor="sendEmailFlag"
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition cursor-pointer ${
              formData.sendEmailFlag
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shrink-0">
                📧
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-semibold text-slate-800">
                  Send Email Notification
                </span>
                <span className="block text-[11px] text-slate-500">
                  Deliver an email copy directly to registered users' inboxes.
                </span>
              </div>
            </div>

            <input
              type="checkbox"
              id="sendEmailFlag"
              name="sendEmailFlag"
              checked={formData.sendEmailFlag}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded cursor-pointer shrink-0"
            />
          </label>

          {/* Submit Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                loading
                  ? "bg-emerald-400 shadow-emerald-200 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Broadcasting Notification...</span>
                </>
              ) : (
                <>
                  <span>📢 Broadcast Notification Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}