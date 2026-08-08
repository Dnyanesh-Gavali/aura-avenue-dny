import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Login Component
 * 
 * Description:
 * Primary authentication interface for AuraAvenue. Supports standard email/password
 * login with dynamic progress indicators as well as Google One-Tap/OAuth login.
 * 
 * @returns {React.ReactNode}
 */

// 📥 Reusable Cards Imports
import ErrorModal from '../ReusableCards/ErrorModal.jsx';

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const loginBg = "https://res.cloudinary.com/xzjjff1k/image/upload/f_auto,q_auto,w_1920/v1784311631/login-bg_our3np.jpg";

function Login() {
    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Submission & Button States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingPercent, setLoadingPercent] = useState(0); 
    const [btnMessage, setBtnMessage] = useState('');
    const [btnStatus, setBtnStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

    // 🔴 Modal State
    const [errorMsg, setErrorMsg] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    const triggerError = (msg) => {
        setErrorMsg(msg);
        setIsErrorOpen(true);
    };

    // Calculate Form Completion Fill Percentage
    const totalFields = 2;
    const filledFields = [email, password].filter((val) => val.trim() !== "").length;
    const inputFillPercent = (filledFields / totalFields) * 100;

    const resetBtnState = () => {
        setBtnStatus('idle');
        setBtnMessage('');
        setIsSubmitting(false);
        setLoadingPercent(0);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!email.trim() || !password) {
            triggerError("Please fill in all fields!");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            triggerError("Please enter a valid email address!");
            return;
        }

        if (password.length < 8) {
            triggerError("Password must be at least 8 characters long!");
            return;
        }

        setIsSubmitting(true);
        setBtnStatus('loading');
        setBtnMessage("Logging in...");
        setLoadingPercent(90);

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: email.trim(), password })
            });

            const data = await response.json();
            await new Promise((resolve) => setTimeout(resolve, 400));

            if (data.success) {
                setLoadingPercent(100);
                setBtnStatus('success');
                setBtnMessage("Login Successful! Redirecting...");
                setTimeout(() => { window.location.href = "/"; }, 1000);
            } else {
                resetBtnState();
                triggerError(data.message || "Invalid credentials!");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            resetBtnState();
            triggerError("Server Connection Error! Please try again.");
        }
    };

    // Google OAuth Response Handler
    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = "/";
            } else {
                setIsSubmitting(false);
                triggerError(data.message || "Google authentication failed!");
            }
        } catch (error) {
            console.error("Google Auth Error:", error);
            setIsSubmitting(false);
            triggerError("Server Connection Error during Google Login!");
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 flex items-center justify-center relative font-sans antialiased"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            {/* Dark Blur Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Main Login Card */}
            <form
                onSubmit={handleLogin}
                className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-5"
            >
                {/* Header Row */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">Sign in to access your account</p>
                    </div>

                    <a
                        href="/contact"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    >
                        Contact Us ↗
                    </a>
                </div>

                {/* Email Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        disabled={isSubmitting}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Password Input & Toggle */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Password
                        </label>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 select-none">
                            <span>Show password</span>
                            <input
                                type="checkbox"
                                checked={showPass}
                                disabled={isSubmitting}
                                onChange={() => setShowPass(!showPass)}
                                className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                        </div>
                    </div>

                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        disabled={isSubmitting}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Submit Button with Dynamic Input Fill & API Progress overlays */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`relative overflow-hidden isolate w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.99] mt-2 ${
                        btnStatus === 'error'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-600/20'
                    } ${isSubmitting ? "cursor-not-allowed opacity-95" : "cursor-pointer"}`}
                >
                    {/* Layer 1: Form Fill Progress Indicator */}
                    <span
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/25 transition-[width] duration-300 ease-out -z-20"
                        style={{ width: `${inputFillPercent}%` }}
                    />

                    {/* Layer 2: API Submission Progress Indicator */}
                    <span
                        className={`absolute left-0 top-0 bottom-0 transition-[width] duration-500 ease-in-out -z-10 ${
                            btnStatus === 'error' ? 'bg-rose-500' : ''
                        } ${btnStatus === 'loading' ? 'bg-emerald-500' : ''} ${
                            btnStatus === 'success' ? 'bg-emerald-400' : ''
                        }`}
                        style={{ width: `${loadingPercent}%` }}
                    />

                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {btnStatus === 'idle' && "Login"}
                        {btnStatus !== 'idle' && btnMessage}
                    </span>
                </button>

                {/* OR Divider */}
                <div className="flex items-center my-3">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
                    <div className="flex-1 border-t border-slate-200" />
                </div>

                {/* Google Login Container */}
                <div className="flex justify-center w-full min-h-[44px]">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => triggerError("Google Login Failed!")}
                        useOneTap
                        theme="outline"
                        shape="rectangular"
                        size="large"
                    />
                </div>

                {/* Utility Links Footer */}
                <div className="flex flex-col space-y-3 pt-2">
                    <a
                        href="/forgotpassword"
                        className="text-right text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition"
                    >
                        Forgot Password?
                    </a>

                    <a
                        href="/signup"
                        className="pt-3 border-t border-slate-100 text-center text-xs font-medium text-slate-500 hover:text-emerald-600 transition"
                    >
                        Don't have an account? <span className="font-semibold text-emerald-600">Sign Up</span>
                    </a>
                </div>
            </form>

            {/* 🔴 ERROR MODAL */}
            <ErrorModal
                isOpen={isErrorOpen}
                message={errorMsg}
                onClose={() => setIsErrorOpen(false)}
            />
        </div>
    );
}

export default Login;