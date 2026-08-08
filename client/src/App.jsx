import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DestApp from './pages/Destination-pages/DestApp';
import Home from './homepage/Home';
import Login from './authentication/Login';
import Signup from './authentication/SignUp';
import Contact from './authentication/Contact';
import About from './authentication/About';
import Navbar from './homepage/Navbar';
import PackagesApp from './packages-booking/PackagesApp';
import Footer from './homepage/Footer';
import ForgotPassword from './authentication/ForgetPassword';
import ItineraryBuilder from './pages/Destination-pages/ItineraryBuilder';

import AdminLayout from "./adminPanel/AdminLayout";
import AdminVerify from "./adminPanel/adminVeryfy";
import ProfileLayout from "./profileSection/ProfileLayout";

// Helper component that reads the current URL
function ConditionalFooter() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Hide footer on specific pages (added '/profile' here so footer doesn't mess up profile sidebar)
  const hiddenPaths = ['/login', '/signup', '/contact', '/reset-password', '/forgotpassword'];

  const hideFooter = hiddenPaths.some(p => path.startsWith(p)) || path.includes('/booking');

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}

function App() {
  return (
    <BrowserRouter>
      {/* Main Navbar Always On Top */}
      <Navbar />

      {/* Main Content */}
      <main className="min-h-screen">
        <Routes>

          <Route
            path="/admin"
            element={
              <AdminVerify>
                <AdminLayout />
              </AdminVerify>
            }
          />

          {/* Profile Route */}
          <Route path="/profile/*" element={<ProfileLayout />} />

          <Route path="/" element={<Home />} />
          <Route path="/destinations/*" element={<DestApp />} />
          <Route path="/packages/*" element={<PackagesApp />} />
          <Route path="/itinerary" element={<ItineraryBuilder />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Conditional Footer */}
      <ConditionalFooter />
    </BrowserRouter>
  );
}

export default App;
