import React, { useState } from 'react';

/**
 * Contact Component
 * 
 * Description:
 * Provides an interactive contact form for users to send inquiries to support.
 * Features client-side validation, direct email copy support, receipt popups,
 * and integrated error modal triggers.
 * 
 * @returns {React.ReactNode}
 */

// 📥 Reusable Error Modal Import
import ErrorModal from '../ReusableCards/ErrorModal';

const loginBg = "https://res.cloudinary.com/xzjjff1k/image/upload/f_auto,q_auto,w_1920/v1784311631/login-bg_our3np.jpg";
const helperIcon = "https://res.cloudinary.com/xzjjff1k/image/upload/v1784309997/helper-icon_znhxx3.jpg";

export default function Contact() {
    // 1. Controlled State Management
    const [formData, setFormData] = useState({
        topic: '',
        emailOrPhone: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [receiptNo, setReceiptNo] = useState("");
    const [copied, setCopied] = useState(false);

    // 🔴 Error Modal State
    const [errorMsg, setErrorMsg] = useState('');
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    const inputClass =
        "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 text-sm placeholder-slate-400 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20";

    const triggerError = (msg) => {
        setErrorMsg(msg);
        setIsErrorOpen(true);
    };

    // Handle Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form Reset Helper
    const clearForm = () => {
        setFormData({
            topic: '',
            emailOrPhone: '',
            message: ''
        });
    };

    // Copy Email Helper
    const handleCopyEmail = () => {
        navigator.clipboard.writeText("auraavenue.travel@gmail.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 2. Submit Handler
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const { topic, emailOrPhone, message } = formData;

        // Client-Side Validation
        if (!topic || !emailOrPhone || !message) {
            triggerError('Please fill in all fields before sending the message.');
            return;
        }

        const isEmail = emailOrPhone.includes('@');
        if (isEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailOrPhone)) {
                triggerError('Please enter a valid email address.');
                return;
            }
        } else {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(emailOrPhone)) {
                triggerError('Please enter a valid 10-digit phone number.');
                return;
            }
        }

        // 3. API Dispatch
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/contact-us`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    topic, 
                    emailOrPhone, 
                    message,
                    status: "pending" 
                })
            });

            const data = await response.json();

            if (data.success) {
                setReceiptNo(data.receiptNo || "N/A");
                setPopupOpen(true);
                clearForm();
            } else {
                triggerError(data.message || 'Failed to submit query.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            triggerError('Failed to send message. Please check server connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            id="contactContainer"
            className="min-h-screen bg-cover bg-center bg-no-repeat py-8 px-4 flex items-center justify-center relative font-sans antialiased"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            {/* Dark Overlay for Depth */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Main Contact Form Card */}
            <form
                id="contactForm"
                onSubmit={handleSendMessage}
                className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/40 flex flex-col space-y-5"
            >
                {/* Header Row */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">We're here to answer any questions</p>
                    </div>

                    <a
                        href="/about"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                    >
                        About Us ↗
                    </a>
                </div>

                {/* Direct Support Card */}
                <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60">
                    <img
                        src={helperIcon}
                        alt="Support Assistant"
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                    />

                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Direct Support Email
                        </span>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <a
                                href="mailto:auraavenue.travel@gmail.com"
                                className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline truncate"
                            >
                                auraavenue.travel@gmail.com
                            </a>

                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                className="ml-auto bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold transition active:scale-95 shadow-sm"
                            >
                                {copied ? "Copied! ✓" : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Separator Divider */}
                <div className="relative flex items-center justify-center my-1">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative px-3 bg-white text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Or Send Message
                    </span>
                </div>

                {/* Form Inputs Group */}
                <div className="space-y-4">
                    {/* Input 1: Topic Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Inquiry Category
                        </label>
                        <select
                            name="topic"
                            value={formData.topic}
                            onChange={handleChange}
                            className={`${inputClass} cursor-pointer`}
                        >
                            <option value="" disabled>Select a topic</option>
                            <option value="general">General Inquiry</option>
                            <option value="help">Need Help / Support</option>
                            <option value="suggestions">Feedback & Suggestions</option>
                        </select>
                    </div>

                    {/* Input 2: Email or Phone */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Email or Phone Number
                        </label>
                        <input
                            name="emailOrPhone"
                            type="text"
                            placeholder="e.g. name@example.com or 10-digit phone"
                            value={formData.emailOrPhone}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Input 3: Message Textarea */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Your Message
                        </label>
                        <textarea
                            name="message"
                            placeholder="Describe your inquiry or request in detail..."
                            value={formData.message}
                            onChange={handleChange}
                            className={`${inputClass} h-28 resize-none`}
                        ></textarea>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Query...</span>
                        </>
                    ) : (
                        "Send Message"
                    )}
                </button>
            </form>

            {/* Success Popup Modal with Receipt Number */}
            {popupOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100 text-center space-y-4">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">
                            ✓
                        </div>

                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Query Received!
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Your ticket has been generated successfully.
                            </p>
                        </div>

                        {/* Receipt Box */}
                        <div className="bg-slate-50 border border-dashed border-slate-300 p-3.5 rounded-xl text-left">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Receipt / Reference No.
                            </span>
                            <span className="text-sm font-mono font-bold text-emerald-600 break-all select-all block">
                                {receiptNo}
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            A confirmation receipt has been sent to your email. Our team will get back to you shortly!
                        </p>

                        <button
                            type="button"
                            onClick={() => setPopupOpen(false)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 text-sm font-semibold transition active:scale-95"
                        >
                            Close & Continue
                        </button>
                    </div>
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