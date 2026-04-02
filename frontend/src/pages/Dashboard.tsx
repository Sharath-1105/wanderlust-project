import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import bg from "../assets/travel-bg.jpeg";

const FEATURES = [
  {
    id: "book",
    icon: "📋",
    emoji: "✈️",
    title: "Book a Trip",
    desc: "Browse curated destinations and book your next adventure",
    path: "/book-trip",
    gradient: "from-brand-500 to-brand-700",
    badge: null,
  },
  {
    id: "trips",
    icon: "🧳",
    emoji: "🗺️",
    title: "My Trips",
    desc: "Track your booked trips with map view and day timeline",
    path: "/my-trips",
    gradient: "from-violet-500 to-purple-700",
    badge: null,
  },
  {
    id: "wishlist",
    icon: "❤️",
    emoji: "💝",
    title: "My Wishlist",
    desc: "Places you've saved — ready to book whenever you are",
    path: "/my-wishlist",
    gradient: "from-pink-500 to-rose-600",
    badge: null,
  },
  {
    id: "explore",
    icon: "🗺️",
    emoji: "🔍",
    title: "Explore Places",
    desc: "Discover beaches, hills, cities & hidden gems across India",
    path: "/explore",
    gradient: "from-cyan-500 to-blue-600",
    badge: null,
  },
  {
    id: "ai",
    icon: "🤖",
    emoji: "✨",
    title: "AI Trip Planner",
    desc: "Get an AI-powered itinerary with cost breakdown in seconds",
    path: "/ai-trip",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    badge: "NEW",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Explorer";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (role === "admin") navigate("/admin-dashboard");
  }, [role, navigate]);

  if (role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 animate-pulse">Redirecting to Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="Dashboard" />

      {/* ── Hero Banner ──────────────────────────────────── */}
      <div
        className="relative h-72 sm:h-80 flex items-end pb-10 px-6 overflow-hidden"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/75 via-brand-800/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto w-full animate-slide-up">
          <p className="text-brand-200 text-sm font-medium mb-1">
            Hello, {name.split(" ")[0]} 👋
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Where would you like<br />
            <span className="text-brand-300">to go next?</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">Explore India's finest destinations</p>
        </div>
      </div>

      {/* ── Feature Cards Grid ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => (
            <button
              key={feat.id}
              id={`dash-${feat.id}`}
              onClick={() => navigate(feat.path)}
              className="card p-6 text-left group relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-2xl bg-gradient-to-b ${feat.gradient}`} />

              {/* Badge */}
              {feat.badge && (
                <span className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {feat.badge}
                </span>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                {feat.emoji}
              </div>

              <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-brand-600 transition-colors">
                {feat.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>

              <div className="mt-4 flex items-center gap-1 text-brand-500 text-sm font-semibold">
                Go <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Logout link */}
        <div className="mt-10 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}