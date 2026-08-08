import React, { useState, useEffect } from 'react';

/**
 * ForgotPassword Component
 * 
 * Description:
 * Facilitates multi-step account recovery for AuraAvenue users.
 * Sends a 6-digit OTP code to the registered email and opens a security verification
 * modal to allow password reset with interactive cooldown timers and modal notifications.
 * 
 * @returns {React.ReactNode}
 */

// 📥 Reusable Cards Imports
import ErrorModal from '../ReusableCards/ErrorModal';
import SuccessModal from '../ReusableCards/SuccessModal';

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const OTP_COOLDOWN_TIME = 10;
const POPUP_COOLDOWN_TIME = 5;

const loginBg = "https://res.cloudinary.com/xzjjff1k/image/upload/f_auto,q_auto,w_1920/v1784311631/login-bg_our3np.jpg";

export default function ForgotPassword() {
    const inputClass = 
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20";

    const [email, setEmail] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // 🔴 🟢 Modals State
    const [errorMsg, setErrorMsg] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    // Timers & Progress States
    const [cooldown, setCooldown] = useState(0);
    const [popupCooldown, setPopupCooldown] = useState(0);

    const fillPercent = cooldown > 0 ? ((OTP_COOLDOWN_TIME - cooldown) / OTP_COOLDOWN_TIME) * 100 : 0;
    const popupFillPercent = popupCooldown > 0 ? ((POPUP_COOLDOWN_TIME - popupCooldown) / POPUP_COOLDOWN_TIME) * 100 : 0;

    const triggerError = (msg) => {
        setErrorMsg(msg);
        setIsErrorOpen(true);
    };

    // Timer 1: Main Page Send OTP Button
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Timer 2: Popup Window Reset Password Button
    useEffect(() => {
        if (popupCooldown <= 0) return;
        const timer = setInterval(() => {
            setPopupCooldown((prev) => (prev <= 1 ? (clearInterval(timer), 0) : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [popupCooldown]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        if (!email.trim()) {
            triggerError("Please enter your registered email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            triggerError("Please enter a valid email address.");
            return;
        }

        setCooldown(OTP_COOLDOWN_TIME);

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success) {
                setOtp('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsPopupOpen(true);
            } else {
                triggerError(data.message || "Account identity credentials not found.");
                setCooldown(0);
            }
        } catch (error) {
            console.error("Error:", error);
            triggerError("Something went wrong! Please check server connection.");
            setCooldown(0);
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (popupCooldown > 0) return;

        if (!otp.trim()) {
            triggerError("Please enter the verification code.");
            return;
        }

        if (newPassword.length < 8) {
            triggerError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            triggerError("Passwords do not match.");
            return;
        }

        setPopupCooldown(POPUP_COOLDOWN_TIME);

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await response.json();

            if (data.success) {
                setIsPopupOpen(false);
                setSuccessMsg("Password updated successfully! Redirecting to login.");
                setIsSuccessOpen(true);
            } else {
                triggerError(data.message || "Verification failed or token expired.");
                setPopupCooldown(0);
            }
        } catch (error) {
            console.error("Error:", error);
            triggerError("Something went wrong!");
            setPopupCooldown(0);
        }
    };

    const handleSuccessClose = () => {
        setIsSuccessOpen(false);
        window.location.href = "/login";
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 flex items-center justify-center relative font-sans antialiased"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            {/* Dark Blur Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Main Recover Account Card */}
            <form
                onSubmit={handleRequestOtp}
                className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-6"
            >
                {/* Header Row */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Recover Account
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">Enter registered details to verify</p>
                    </div>

                    <a
                        href="/login"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    >
                        Login ↗
                    </a>
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Registered Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Submit / Resend OTP Button */}
                <button
                    type="submit"
                    disabled={cooldown > 0}
                    className={`relative overflow-hidden isolate w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.99] ${
                        cooldown > 0
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                    }`}
                >
                    {cooldown > 0 && (
                        <span
                            className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-1000 ease-linear -z-10"
                            style={{ width: `${fillPercent}%` }}
                        />
                    )}
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Send Verification OTP"}
                </button>
            </form>

            {/* OTP & Password Reset Security Modal */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <form
                        onSubmit={handleResetPasswordSubmit}
                        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col space-y-4"
                    >
                        <div className="text-center pb-2 border-b border-slate-100">
                            <h2 className="text-xl font-extrabold text-slate-900">
                                Verify Security Identity
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                Provide the code sent to <span className="font-semibold text-slate-700">{email}</span> and set your new password.
                            </p>
                        </div>

                        {/* OTP Code Input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Enter 6-Digit OTP Code
                            </label>
                            <input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={`${inputClass} tracking-widest font-mono text-center text-base`}
                            />
                        </div>

                        {/* View Passwords Checkbox */}
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-600 pt-1">
                            <span>Show passwords</span>
                            <input
                                type="checkbox"
                                checked={showPass}
                                onChange={() => setShowPass(!showPass)}
                                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                New Security Password
                            </label>
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="At least 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Re-type your password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="space-y-2 pt-2">
                            <button
                                type="submit"
                                disabled={popupCooldown > 0}
                                className={`relative overflow-hidden isolate w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.99] ${
                                    popupCooldown > 0
                                        ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                                }`}
                            >
                                {popupCooldown > 0 && (
                                    <span
                                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-1000 ease-linear -z-10"
                                        style={{ width: `${popupFillPercent}%` }}
                                    />
                                )}
                                {popupCooldown > 0 ? `Processing... (${popupCooldown}s)` : "Reset Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsPopupOpen(false)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-3 text-xs font-semibold transition active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 🔴 ERROR MODAL */}
            <ErrorModal
                isOpen={isErrorOpen}
                message={errorMsg}
                onClose={() => setIsErrorOpen(false)}
            />

            {/* 🟢 SUCCESS MODAL */}
            <SuccessModal
                isOpen={isSuccessOpen}
                message={successMsg}
                onClose={handleSuccessClose}
            />
        </div>
    );
}