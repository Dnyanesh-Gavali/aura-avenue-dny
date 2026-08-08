import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

/**
 * Admin Route Component (Route Guard)
 * 
 * Description:
 * Protects administrative routes by verifying the current user's session token and role.
 * Renders a loading state while validating credentials, redirects unauthorized users
 * to the home page, and renders protected child components for verified admin accounts.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if the user is an authorized admin.
 * 
 * @returns {React.ReactNode} Protected children components or dynamic redirect.
 */
export default function AdminRoute({ children }) {
    // Session state management
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Verify user authorization on mount
    useEffect(() => {
        checkAdmin();
    }, []);

    /** Asynchronously verifies authorization token and checks if user role is "admin" */
    async function checkAdmin() {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-token`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            // Validate success status and admin role permissions
            if (data.success && data.role === "admin") {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error("Admin verification check failed:", err);
        } finally {
            setLoading(false);
        }
    }

    /* Loading UI - Rendered while verifying authentication status */
    if (loading) {
        return (
            <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 antialiased">
                <div className="flex flex-col items-center gap-3 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xs w-full text-center">
                    {/* Responsive Loading Spinner */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">
                        Verifying Admin Access...
                    </span>
                </div>
            </div>
        );
    }

    /* Unauthorized Redirection - Redirects non-admin users to home route */
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    /* Authorized - Render protected administrative content */
    return children;
}