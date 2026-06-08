import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import bg from "../assets/travel-bg.jpeg";
import { SFX } from "../hooks/useSound";

const FEATURES = [
  {
    id: "book",
    icon: "✈️",
    title: "Book a Trip",
    desc: "Browse curated destinations and book your next adventure with real-time pricing",
    path: "/book-trip",
    gradient: "from-brand-500 to-brand-700",
    glowColor: "rgba(14,165,233,0.25)",
    badge: null,
    accent: "#0ea5e9",
  },
  {
    id: "trips",
    icon: "🧳",
    title: "My Trips",
    desc: "Track all your booked adventures with map view and day-wise timelines",
    path: "/my-trips",
    gradient: "from-violet-500 to-purple-700",
    glowColor: "rgba(139,92,246,0.25)",
    badge: null,
    accent: "#8b5cf6",
  },
  {
    id: "wishlist",
    icon: "❤️",
    title: "My Wishlist",
    desc: "Places you've saved and dreamed about — ready to book whenever you are",
    path: "/my-wishlist",
    gradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(236,72,153,0.25)",
    badge: null,
    accent: "#ec4899",
  },
  {
    id: "explore",
    icon: "🗺️",
    title: "Explore Places",
    desc: "Discover beaches, hills, heritage sites & hidden gems across India",
    path: "/explore",
    gradient: "from-nature-500 to-emerald-600",
    glowColor: "rgba(34,197,94,0.25)",
    badge: null,
    accent: "#22c55e",
  },
  {
    id: "ai",
    icon: "🤖",
    title: "AI Trip Planner",
    desc: "Get a personalised itinerary with cost breakdown in seconds — powered by AI",
    path: "/ai-trip",
    gradient: "from-sunset-400 via-orange-500 to-brand-500",
    glowColor: "rgba(249,115,22,0.25)",
    badge: "AI",
    accent: "#f97316",
  },
];

const DESTINATION_PREVIEWS = [
  { name: "Goa", emoji: "🏖️", tag: "Beach" },
  { name: "Himachal", emoji: "⛰️", tag: "Mountains" },
  { name: "Rajasthan", emoji: "🏰", tag: "Heritage" },
  { name: "Kerala", emoji: "🌴", tag: "Nature" },
  { name: "Ladakh", emoji: "🦅", tag: "Adventure" },
  { name: "Rishikesh", emoji: "🕉️", tag: "Spiritual" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Explorer";
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (role === "admin") navigate("/admin-dashboard");
  }, [role, navigate]);

  if (role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF] dark:bg-[#0F172A]">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Redirecting to Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-base">
      <Navbar title="Dashboard" />

      {/* ── Hero Banner ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          minHeight: "380px",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-brand-900/60 to-brand-800/40" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F0F9FF] dark:from-[#0F172A] to-transparent" />

        {/* Decorative orbs */}
        <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-nature-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          {/* Greeting pill */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-nature-400 animate-pulse" />
            {greeting}, {name.split(" ")[0]} 👋
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4 animate-slide-up">
            Where would you
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-nature-300">
              like to go next?
            </span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-lg animate-fade-in" style={{ animationDelay: "100ms" }}>
            Explore India's finest destinations — from the Himalayas to the backwaters of Kerala.
          </p>

          {/* Quick destination chips */}
          <div className="flex flex-wrap gap-2 mt-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {DESTINATION_PREVIEWS.map((d) => (
              <button
                key={d.name}
                onClick={() => navigate("/explore")}
                className="flex items-center gap-1.5 bg-white/12 hover:bg-white/22 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 transition-all duration-200 hover:scale-105"
              >
                {d.emoji} {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature Cards ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 pb-16">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-brand-500 to-nature-500" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">What would you like to do?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <button
              key={feat.id}
              id={`dash-${feat.id}`}
              onClick={() => { SFX.click(); navigate(feat.path); }}
              className="glass-card p-6 text-left group relative overflow-hidden animate-fade-in cursor-pointer"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* Glow orb on hover */}
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
                style={{ background: feat.glowColor }}
              />

              {/* Badge */}
              {feat.badge && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-sunset-400 to-sunset-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {feat.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                style={{ width: 52, height: 52, boxShadow: `0 4px 16px ${feat.glowColor}` }}
              >
                {feat.icon}
              </div>

              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg mb-1.5 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {feat.desc}
              </p>

              <div
                className="mt-5 flex items-center gap-1.5 text-sm font-bold"
                style={{ color: feat.accent }}
              >
                Explore
                <span className="group-hover:translate-x-2 transition-transform duration-300 text-base">→</span>
              </div>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="mt-12 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
          >
            Sign out ↗
          </button>
        </div>
      </div>
    </div>
  );
}