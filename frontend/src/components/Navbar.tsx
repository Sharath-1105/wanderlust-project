import { useNavigate, useLocation } from "react-router-dom";

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = localStorage.getItem("name") || "User";
  const initial = firstName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard",  label: "Home",    icon: "🏠" },
    { path: "/explore",    label: "Explore", icon: "🗺️" },
    { path: "/book-trip",  label: "Book",    icon: "📋" },
    { path: "/my-trips",   label: "Trips",   icon: "🧳" },
    { path: "/ai-trip",    label: "AI Plan", icon: "🤖" },
    { path: "/my-wishlist",label: "Wishlist",icon: "❤️" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition-transform">
            🌍
          </div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">
            Wander<span className="text-brand-500">lust</span>
          </span>
        </button>

        {/* Page title (mobile) */}
        {title && (
          <span className="sm:hidden text-sm font-semibold text-slate-600">
            {title}
          </span>
        )}

        {/* Nav links (desktop) */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: avatar + logout */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {initial}
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:block text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
