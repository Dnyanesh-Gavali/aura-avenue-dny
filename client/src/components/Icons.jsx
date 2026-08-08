// Small inline icon set shared across components — no external icon
// library required. Import only what each file needs.

export const PinIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 21s-6.75-6.19-6.75-11.25a6.75 6.75 0 0 1 13.5 0C18.75 14.81 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="9.75" r="2.25" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.5l2.9 6.06 6.6.79-4.86 4.6 1.28 6.55L12 17.77l-5.92 3.23 1.28-6.55-4.86-4.6 6.6-.79L12 2.5Z" />
  </svg>
);

export const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const ArrowIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 12.5l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 3.5 21.5 20h-19L12 3.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M12 9.5v4.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="12" cy="16.75" r="0.9" fill="currentColor" />
  </svg>
);

export const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const MapIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M9 4.5 3.8 6.3a1 1 0 0 0-.8.97v11.7a.6.6 0 0 0 .8.57L9 17.5m0-13v13m0-13 6 2m-6 11 6 2m0-13v13m0-13 5.2-1.8a1 1 0 0 1 1.3.94v11.7a1 1 0 0 1-.68.95L15 19.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const GridIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const HeartIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"}>
    <path
      d="M12 20.5s-7.5-4.6-10-9.3C.6 7.8 2.3 4 6 4c2.1 0 3.6 1.1 4.5 2.4L12 8.1l1.5-1.7C14.4 5.1 15.9 4 18 4c3.7 0 5.4 3.8 4 7.2-2.5 4.7-10 9.3-10 9.3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="aura-ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FED373" />
        <stop offset="25%" stopColor="#F15245" />
        <stop offset="50%" stopColor="#D92E7F" />
        <stop offset="75%" stopColor="#9B36B7" />
        <stop offset="100%" stopColor="#515ECF" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#aura-ig-gradient)" />
    <circle cx="12" cy="12" r="5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="17.3" cy="6.7" r="1.2" fill="#FFFFFF" />
  </svg>
);

export const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path
      d="M14.5 8.5h1.8V5.6h-1.8c-2.1 0-3.4 1.4-3.4 3.5V11H9.3v2.9h1.8V19h3V13.9h1.9l.3-2.9h-2.2V9.4c0-.6.2-.9.9-.9Z"
      fill="#FFFFFF"
    />
  </svg>
);


export const XLogoIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M3.5 3.5h4.9l4.1 5.4 4.1-5.4h3.9l-6 7.9 6.5 8.6h-4.9l-4.5-5.9-4.5 5.9H3.2l6.5-8.6-6.2-8.3Z"
      fill="#FFFFFF"
    />
  </svg>
);