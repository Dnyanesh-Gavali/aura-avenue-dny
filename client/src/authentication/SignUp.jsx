import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * SignUp Component
 * 
 * Description:
 * Registration interface for AuraAvenue supporting standard multi-field registration
 * with email OTP verification, alongside Google One-Tap/OAuth registration.
 * 
 * @returns {React.ReactNode}
 */

// Reusable Cards
import SuccessModal from '../ReusableCards/SuccessModal';
import ErrorModal from '../ReusableCards/ErrorModal';

// Same folder import
import SetPassword from './SetPassword';

const loginBg = "https://res.cloudinary.com/xzjjff1k/image/upload/f_auto,q_auto,w_1920/v1784311631/login-bg_our3np.jpg";

function SignUp() {
    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed";

    // Form Inputs State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // OTP Modal & State
    const [otp1, setOtp1] = useState('');
    const [isOtpPopupOpen, setIsOtpPopupOpen] = useState(false);
    const [otpStatus, setOtpStatus] = useState('idle'); // 'idle' | 'verifying' | 'verified'
    const [otpProgress, setOtpProgress] = useState(0);
    const [cooldown, setCooldown] = useState(0);

    // Google Multi-step Auth State
    const [googleUserData, setGoogleUserData] = useState(null);
    const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);

    // Modals State
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    // Modal Actions
    const [onSuccessCloseAction, setOnSuccessCloseAction] = useState(() => () => {});
    const [onErrorCloseAction, setOnErrorCloseAction] = useState(() => () => {});

    // Calculate Form Field Completion Fill Percentage
    const totalFields = 5;
    const filledFields = [fullName, email, phone, password, confirmPassword].filter((val) => val.trim() !== "").length;
    const fillPercent = (filledFields / totalFields) * 100;

    const showSuccess = (msg, callback) => {
        setModalMessage(msg);
        setOnSuccessCloseAction(() => callback || (() => {}));
        setIsSuccessModalOpen(true);
    };

    const showError = (msg, callback) => {
        setModalMessage(msg);
        setOnErrorCloseAction(() => callback || (() => {}));
        setIsErrorModalOpen(true);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-google-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            const data = await response.json();

            if (data.success) {
                if (data.isExistingUser) {
                    showError("You already have an account, please try to login.", () => {
                        window.location.href = "/login";
                    });
                } else {
                    setGoogleUserData({
                        fullName: data.name,
                        email: data.email,
                        googleId: data.googleId
                    });
                    setIsSetPasswordOpen(true);
                }
            } else {
                showError(data.message || "Google Authentication failed");
            }
        } catch (error) {
            console.error("Google Auth Error:", error);
            showError("Google Sign-In failed. Please try again.");
        }
    };

    const handleFinalGoogleSignup = async (fullUserData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/googleSignup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(fullUserData)
            });

            const data = await response.json();

            if (data.success) {
                setIsSetPasswordOpen(false);
                showSuccess("Account created successfully!", () => {
                    window.location.href = "/";
                });
            } else {
                showError(data.message || "Failed to create account.");
            }
        } catch (error) {
            console.error("Google Signup Error:", error);
            showError("Server error during account creation.");
        }
    };

    const handleSignup = async () => {
        const userData = { fullName, email, phone, password };
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                setOtpProgress(100);

                setTimeout(() => {
                    setIsOtpPopupOpen(false);
                    setOtpProgress(0);
                    showSuccess(data.message || "Account created successfully!", () => {
                        window.location.href = "/";
                    });
                }, 400);
            } else {
                setIsOtpPopupOpen(false);
                setOtpProgress(0);
                setOtpStatus('idle');
                showError(data.message || "Failed to create account.");
            }
        }
        catch (error) {
            console.error("Error signing up:", error);
            setIsOtpPopupOpen(false);
            setOtpProgress(0);
            setOtpStatus('idle');
            showError("Something went wrong on the server!");
        }
    };

    const openOtpWindow = async (e) => {
        if (e) e.preventDefault();

        if (cooldown > 0) return;

        if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
            showError("Please fill in all fields");
            return;
        }

        if (fullName.trim().length < 3) {
            showError("Enter a valid full name");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            showError("Enter a valid email address");
            return;
        }

        if (!/^\d{10}$/.test(phone.trim())) {
            showError("Phone number must contain exactly 10 digits");
            return;
        }

        if (password.length < 8) {
            showError("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        setCooldown(10);
        setOtp1('');
        setOtpStatus('idle');
        setOtpProgress(0);

        try {
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await response.json();

            if (data.success) {
                setIsOtpPopupOpen(true);
            } else {
                showError(data.message || "Failed to send OTP.");
            }
        }
        catch (error) {
            console.error("Error sending OTP:", error);
            showError("Failed to send OTP. Please try again.");
        }
    };

    const handleOtpVerification = async (e) => {
        if (e) e.preventDefault();

        if (!otp1.trim()) {
            showError("Please enter the OTP");
            return;
        }

        setOtpStatus('verifying');
        setOtpProgress(30);

        setTimeout(() => {
            setOtpProgress(75);
        }, 300);

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), otp1: otp1.trim() })
            });

            const data = await response.json();

            if (data.success) {
                setOtpProgress(90);
                setOtpStatus('verified');
                handleSignup();
            } else {
                setOtpStatus('idle');
                setOtpProgress(0);
                showError(data.message || "Incorrect OTP! Try again.");
            }
        }
        catch (error) {
            console.error("Error verifying OTP:", error);
            setOtpStatus('idle');
            setOtpProgress(0);
            showError("Failed to verify OTP. Please try again.");
        }
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 flex items-center justify-center relative font-sans antialiased"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            {/* Dark Blur Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Main SignUp Card */}
            <form
                onSubmit={openOtpWindow}
                className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-4"
            >
                {/* Header Row */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Sign Up
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">Create your AuraAvenue account</p>
                    </div>

                    <a
                        href="/contact"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    >
                        Contact Us ↗
                    </a>
                </div>

                {/* Full Name Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="First and last name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputClass}
                    />
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
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Phone Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                            <span>Show passwords</span>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                            />
                        </div>
                    </div>

                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 8 chars)"
                        value={password}
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
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                    />
                </div>

                {/* Submit Button with Live Input Fill */}
                <button
                    type="submit"
                    disabled={cooldown > 0}
                    className={`relative overflow-hidden isolate w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.99] mt-2 ${
                        cooldown > 0
                            ? "bg-slate-400 text-white cursor-not-allowed"
                            : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                    }`}
                >
                    {/* Input Fill Progress Bar */}
                    <span
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/25 transition-[width] duration-300 ease-out -z-10"
                        style={{ width: `${fillPercent}%` }}
                    />

                    <span className="relative z-10">
                        {cooldown > 0 ? `Wait ${cooldown}s` : "Sign Up"}
                    </span>
                </button>

                {/* OR Divider */}
                <div className="flex items-center my-2">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">OR</span>
                    <div className="flex-1 border-t border-slate-200" />
                </div>

                {/* Google Sign-Up Container */}
                <div className="flex justify-center w-full min-h-[44px]">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => showError("Google authentication failed")}
                        shape="rectangular"
                        theme="outline"
                        size="large"
                    />
                </div>

                {/* Footer Link */}
                <a
                    href="/login"
                    className="pt-3 border-t border-slate-100 text-center text-xs font-medium text-slate-500 hover:text-emerald-600 transition"
                >
                    Already have an account? <span className="font-semibold text-emerald-600">Login</span>
                </a>
            </form>

            {/* 🔐 OTP Verification Modal */}
            {isOtpPopupOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 antialiased font-sans animate-in fade-in duration-200">
                    <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                OTP Verification
                            </h2>
                            <p className="text-xs text-slate-500 mt-1 leading-normal">
                                We sent a verification code to <span className="font-semibold text-slate-900">{email}</span>
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp1}
                            disabled={otpStatus === 'verified' || otpStatus === 'verifying'}
                            onChange={(e) => setOtp1(e.target.value)}
                            className={`${inputClass} text-center tracking-[4px] font-mono text-base font-bold`}
                        />

                        {/* Verify Button with Dynamic Loading Bar */}
                        <button
                            type="button"
                            onClick={handleOtpVerification}
                            disabled={otpStatus === 'verifying' || otpStatus === 'verified'}
                            className="relative overflow-hidden isolate w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:cursor-wait"
                        >
                            <span
                                className="absolute left-0 top-0 bottom-0 bg-emerald-500 transition-[width] duration-500 ease-out -z-10"
                                style={{ width: `${otpProgress}%` }}
                            />

                            <span className="relative z-10">
                                {otpStatus === 'verifying' && `Verifying... ${otpProgress}%`}
                                {otpStatus === 'verified' && `OTP Verified! Redirecting...`}
                                {otpStatus === 'idle' && "Verify OTP"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOtpPopupOpen(false);
                                setOtpProgress(0);
                                setOtpStatus('idle');
                            }}
                            disabled={otpStatus === 'verifying' || otpStatus === 'verified'}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 rounded-xl py-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Set Password Modal for Google Multi-step Signup */}
            {isSetPasswordOpen && googleUserData && (
                <SetPassword
                    googleUserData={googleUserData}
                    onPasswordSubmit={handleFinalGoogleSignup}
                    onCancel={() => setIsSetPasswordOpen(false)}
                />
            )}

            {/* Success Card Modal */}
            <SuccessModal
                isOpen={isSuccessModalOpen}
                message={modalMessage}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    onSuccessCloseAction();
                }}
            />

            {/* Error Card Modal */}
            <ErrorModal
                isOpen={isErrorModalOpen}
                message={modalMessage}
                onClose={() => {
                    setIsErrorModalOpen(false);
                    onErrorCloseAction();
                }}
            />
        </div>
    );
}

export default SignUp;