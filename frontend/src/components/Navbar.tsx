import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { SFX } from "../hooks/useSound";
import SoundToggle from "./SoundToggle";

interface NavbarProps { title?: string; }

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Navbar({ title }: NavbarProps) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { theme, toggle } = useTheme();
  const firstName  = localStorage.getItem("name") || "User";
  const initial    = firstName.charAt(0).toUpperCase();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    SFX.nav();
    localStorage.clear();
    navigate("/");
  };

  const goTo = (path: string) => {
    SFX.nav();
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard",   label: "Home",    icon: "🏠" },
    { path: "/explore",     label: "Explore", icon: "🗺️" },
    { path: "/book-trip",   label: "Book",    icon: "✈️" },
    { path: "/my-trips",    label: "Trips",   icon: "🧳" },
    { path: "/ai-trip",     label: "AI Plan", icon: "🤖" },
    { path: "/my-wishlist", label: "Wishlist",icon: "❤️" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg dark:shadow-black/30" : ""
      }`}
      style={{
        background: scrolled
          ? theme === "dark" ? "rgba(15,23,42,0.93)" : "rgba(240,249,255,0.90)"
          : theme === "dark" ? "rgba(15,23,42,0.78)" : "rgba(240,249,255,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? theme === "dark" ? "1px solid rgba(14,165,233,0.15)" : "1px solid rgba(14,165,233,0.2)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <button
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300 shadow-brand-500/30">
            🌍
          </div>
          <span className="font-extrabold text-xl text-slate-800 dark:text-white tracking-tight">
            Wander<span className="text-brand-500">lust</span>
          </span>
        </button>

        {/* Page title (mobile) */}
        {title && (
          <span className="sm:hidden text-sm font-semibold text-slate-600 dark:text-slate-300">
            {title}
          </span>
        )}

        {/* Nav links (desktop) */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => goTo(link.path)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-brand-500/15 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
              {isActive(link.path) && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-0.5" />
              )}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          {/* Sound toggle */}
          <div className="hidden sm:flex">
            <SoundToggle />
          </div>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            onClick={() => { SFX.toggle(); toggle(); }}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
              text-slate-500 dark:text-slate-400
              hover:bg-brand-50 dark:hover:bg-slate-800
              hover:text-brand-600 dark:hover:text-brand-400
              border border-transparent hover:border-brand-200 dark:hover:border-slate-700"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/30 flex-shrink-0 cursor-default select-none">
            {initial}
          </div>

          {/* Logout (desktop) */}
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
          >
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => { SFX.click(); setMobileOpen((o) => !o); }}
            className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              {mobileOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="sm:hidden border-t dark:border-slate-800 border-brand-100 animate-fade-in"
          style={{
            background: theme === "dark" ? "rgba(15,23,42,0.97)" : "rgba(240,249,255,0.97)",
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { goTo(link.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive(link.path)
                    ? "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                {link.label}
              </button>
            ))}
            {/* Sound toggle in mobile */}
            <div className="px-4 py-2">
              <SoundToggle showLabel />
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
