import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Booking from "./pages/Booking";
import BookingSummary from "./pages/BookingSummary";
import Packages from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import ScrollToTop from "../components/DestinationDetailPageComponents/ScrollToTop";

// Helper function to create URL-friendly titles (e.g., "Shimla & Manali" -> "shimla-manali")
const createSlug = (title) => {
    if (!title) return "";
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

function PackagesWrapper() {

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);

    const fetchPackages = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/packages`);

            if (!response.ok) {
                throw new Error("Server Error");
            }

            const result = await response.json();

            if (result.success) {
                setPackages(result.data);
            } else {
                setError(result.message || "Unable to load packages.");
            }

        } catch (err) {
            console.error(err);
            setError("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/verify-token`, {
                    method: "POST",
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setUserData({ name: data.name, email: data.email });
                }
            } catch (err) {
                console.error("Failed to fetch user in PackagesApp", err);
            }
        };
        checkUser();
    }, []);


    return <PackagesRoutes packages={packages} loading={loading} error={error} onRetry={fetchPackages} userData={userData} />;
}

function PackagesRoute({ packages, loading, error, onRetry }) {
    const navigate = useNavigate();
    return (
        <Packages
            packages={packages}
            loading={loading}
            error={error}
            onRetry={onRetry}
            onBookNow={(tourPackage) =>
                navigate(`/packages/details/${createSlug(tourPackage.title)}`)
            }
        />
    );
}

function PackageDetailsRoute({ packages,userData }) {
    const navigate = useNavigate();
    return (
        <PackageDetails
            packages={packages}
            // The actual booking logic triggered inside the details page
            onBookNow={(tourPackage) => navigate(`/packages/booking/${createSlug(tourPackage.title)}`)}
            // For the similar packages slider to also open details pages
            onViewDetails={(tourPackage) => navigate(`/packages/details/${createSlug(tourPackage.title)}`)}
            userData={userData}
        />
    );
}

function BookingRoute({ packages }) {
    const navigate = useNavigate();
    const { packageId } = useParams();

    // Find the package by comparing the slugified title
    const selectedPackage = packages.find(
        (tourPackage) => createSlug(tourPackage.title) === packageId
    );

    // If a user types a fake ID in the URL, safely send them back to the packages page
    if (!selectedPackage) {
        return <Navigate to="/packages" replace />;
    }

    return (
        <Booking
            selectedPackage={selectedPackage}
            onBack={() => navigate(`/packages/details/${createSlug(selectedPackage.title)}`)}
            onContinue={(bookingData) =>
                navigate(`/packages/booking/${createSlug(selectedPackage.title)}/summary`, {
                    state: { bookingData },
                })
            }
        />
    );
}

function BookingSummaryRoute({ packages }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { packageId } = useParams();

    const selectedPackage = packages.find(
        (tourPackage) => createSlug(tourPackage.title) === packageId
    );

    const bookingData = location.state?.bookingData;

    if (!selectedPackage) {
        return <Navigate to="/packages" replace />;
    }

    if (!bookingData) {
        return <Navigate to={`/packages/booking/${createSlug(selectedPackage.title)}`} replace />;
    }

    return (
        <BookingSummary
            selectedPackage={selectedPackage}
            bookingData={bookingData}
            onBack={() => navigate(`/packages/booking/${createSlug(selectedPackage.title)}`)}
        />
    );
}

function PackagesRoutes({ packages, loading, error, onRetry ,userData}) {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Use 'index' to guarantee it perfectly matches the base /packages route */}
                <Route index element={<PackagesRoute packages={packages} loading={loading}
                    error={error}
                    onRetry={onRetry} />} />

                {/*  Relative child routes */}
                <Route path="details/:packageId" element={<PackageDetailsRoute packages={packages} userData={userData}/>} />
                <Route path="booking/:packageId" element={<BookingRoute packages={packages} />} />
                <Route path="booking/:packageId/summary" element={<BookingSummaryRoute packages={packages} />} />

                {/* Safe absolute fallback to prevent infinite loops */}
                <Route path="*" element={<Navigate to="/packages" replace />} />
            </Routes>
        </>
    );
}

function PackagesApp() {
    return <PackagesWrapper />;
}

export default PackagesApp;