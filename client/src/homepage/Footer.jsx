import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckIcon, AlertIcon, InstagramIcon, FacebookIcon, XLogoIcon } from "./Icons";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | error | submitting | success
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    // Form validation per handbook: don't let users submit empty/invalid data.
    if (!trimmedEmail) {
      setStatus("error");
      setErrorMessage("Enter your email to subscribe.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setStatus("error");
      setErrorMessage("That doesn't look like a valid email address.");
      return;
    }

    
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 600);
  };

  return (
    <footer className="bg-[#14201A] text-[#DCE3DD]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-extrabold text-white">AuraAvenue</p>
            <p className="mt-3 max-w-xs text-sm text-[#9BA69D]">
              Handpicked destinations and ready-made itineraries for travelers who&rsquo;d rather explore than plan.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                {
                  Icon: InstagramIcon,
                  full: "Instagram",
                  tiltClass: "hover:-rotate-6",
                },
                {
                  Icon: XLogoIcon,
                  full: "X (formerly Twitter)",
                  tiltClass: "hover:rotate-6",
                },
                {
                  Icon: FacebookIcon,
                  full: "Facebook",
                  tiltClass: "hover:-rotate-6",
                },
              ].map(({ Icon, full, tiltClass }) => (
                <a
                  key={full}
                  href="#"
                  aria-label={full}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#2C382F] transition-all duration-300 ease-out hover:scale-110 hover:border-[#1EA35B] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:hover:rotate-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DD68C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14201A] ${tiltClass}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#9BA69D]">
              <li><Link to="/destinations" className="hover:text-[#1EA35B]">Destinations</Link></li>
              <li><Link to="/packages" className="hover:text-[#1EA35B]">Packages</Link></li>
              <li><Link to="/itinerary" className="hover:text-[#1EA35B]">Itinerary Builder</Link></li>
              <li><Link to="/about" className="hover:text-[#1EA35B]">About Us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Support</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#9BA69D]">
              <li><Link to="/contact" className="hover:text-[#1EA35B]">Contact Us</Link></li>
              <li><a href="#" className="hover:text-[#1EA35B]">FAQs</a></li>
              <li><a href="#" className="hover:text-[#1EA35B]">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#1EA35B]">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Stay in the loop</p>
            <p className="mt-4 text-sm text-[#9BA69D]">Deals and new destinations, once or twice a month.</p>

            {status === "success" ? (
              <p className="mt-4 flex items-center gap-2 rounded-lg border border-[#1EA35B]/40 bg-[#1EA35B]/10 px-3 py-2.5 text-sm text-[#5FD98E]">
                <CheckIcon className="h-4 w-4 flex-shrink-0" />
                You&rsquo;re on the list — thanks for subscribing.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="mt-4">
                <div
                  className={`flex overflow-hidden rounded-lg border ${
                    status === "error" ? "border-[#D14343]" : "border-[#2C382F]"
                  }`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="you@example.com"
                    aria-invalid={status === "error"}
                    aria-describedby={status === "error" ? "newsletter-error" : undefined}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-[#6B7167] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3DD68C]"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="flex-shrink-0 bg-[#167A44] px-4 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#125E36] hover:shadow-[0_10px_24px_-6px_rgba(22,122,68,0.55)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {status === "submitting" ? "Joining…" : "Join"}
                  </button>
                </div>
                {status === "error" && (
                  <p id="newsletter-error" role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#F08A8A]">
                    <AlertIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[#2C382F] pt-6 text-xs text-[#6B7167] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} AuraAvenue. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
