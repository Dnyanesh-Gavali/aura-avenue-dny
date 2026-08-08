import React, { useState } from 'react';

/**
 * SetPassword Modal Component
 * 
 * Description:
 * Overlay modal used during Google OAuth registration when additional password 
 * creation is required to complete account setup.
 * 
 * @param {Object} props
 * @param {Object} props.googleUserData - User profile payload from Google OAuth
 * @param {Function} props.onPasswordSubmit - Form submit handler
 * @param {Function} props.onCancel - Modal dismissal handler
 * @returns {React.ReactNode}
 */

function SetPassword({ googleUserData, onPasswordSubmit, onCancel }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

    // Calculate Form Completion Fill Percentage
    const totalFields = 2;
    const filledFields = [password, confirmPassword].filter((val) => val.trim() !== "").length;
    const inputFillPercent = (filledFields / totalFields) * 100;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!password || !confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        onPasswordSubmit({
            fullName: googleUserData?.fullName || '',
            email: googleUserData?.email || '',
            googleId: googleUserData?.googleId || '',
            password: password
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 antialiased font-sans animate-in fade-in duration-200">
            {/* Modal Container */}
            <form 
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-5"
            >
                {/* Header Section */}
                <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Set Your Password
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Create a password for <span className="font-semibold text-emerald-700">{googleUserData?.email}</span>
                    </p>
                </div>

                {/* Inline Error Alert */}
                {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2">
                        <span className="shrink-0 text-base">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* New Password Input */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Create Password
                        </label>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 select-none">
                            <span>Show password</span>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                disabled={isSubmitting}
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                        </div>
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 8 characters)"
                        value={password}
                        disabled={isSubmitting}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        disabled={isSubmitting}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2.5 pt-2">
                    {/* Submit Button with Live Progress Fill */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative overflow-hidden isolate w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {/* Form Completion Progress Fill Layer */}
                        <span
                            className="absolute left-0 top-0 bottom-0 bg-emerald-500/30 transition-[width] duration-300 ease-out -z-10"
                            style={{ width: `${inputFillPercent}%` }}
                        />
                        <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
                    </button>

                    {/* Cancel Button */}
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-xl py-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SetPassword;