import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";
import { SFX } from "../hooks/useSound";
import { OnboardingOverlay } from "../components/PageTransition";
import SoundToggle from "../components/SoundToggle";

const STATS = [
  { value: "500+", icon: "🗺️", label: "Destinations" },
  { value: "AI",   icon: "🤖", label: "Trip Planner" },
  { value: "₹",    icon: "💰", label: "Best Prices"  },
];

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const navigate = useNavigate();

  const handleLogin = useCallback(async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      SFX.error();
      return;
    }
    try {
      setLoading(true);
      SFX.click();
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      localStorage.setItem("name",  res.data.name || "User");
      SFX.success();
      // Show onboarding overlay, then navigate
      setOnboarding(true);
    } catch (err: any) {
      SFX.error();
      setError(err.response?.data?.msg || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }, [email, password, navigate]);

  return (
    <>
      <OnboardingOverlay show={onboarding} onDone={() => navigate("/dashboard")} />

      {/* ── Full-screen background ─────────────────────── */}
      <div
        className="min-h-screen relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "100dvh" }}
      >
        {/* Background image with slow zoom */}
        <div
          className="absolute inset-0 animate-zoom-bg"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transformOrigin: "center center",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/42" />

        {/* Radial glow behind card */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 60%)",
            animation: "glowPulse 5s ease-in-out infinite",
          }}
        />

        {/* Sound toggle */}
        <div className="absolute top-5 right-5 z-50">
          <SoundToggle />
        </div>

        {/* ── Main content ───────────────────────────────── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20 py-12">

          {/* LEFT: Hero text */}
          <div className="hidden lg:flex flex-col flex-1 text-white max-w-lg animate-fade-in">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                🌍
              </div>
              <span className="text-2xl font-extrabold tracking-tight">Wanderlust</span>
            </div>

            <h1 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] mb-5 tracking-tight">
              Explore India,
              <br />
              <span className="gradient-text-hero">
                one adventure at a time.
              </span>
            </h1>
            <p className="text-white/65 text-lg max-w-sm leading-relaxed mb-10">
              Plan, book, and experience the best of Indian travel — powered by AI.
            </p>

            {/* Stats */}
            <div className="flex gap-10">
              {STATS.map((s) => (
                <div key={s.label} className="animate-fade-in">
                  <p className="text-3xl mb-0.5">{s.icon}</p>
                  <p className="font-extrabold text-white text-2xl">{s.value}</p>
                  <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Glassmorphism card */}
          <div
            className="glass-login-card w-full max-w-[400px] p-8 sm:p-10 animate-slide-right flex-shrink-0"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg border border-white/20">
                🌍
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Wanderlust</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">
              Welcome back
            </h2>
            <p className="text-white/50 text-sm mb-7">
              Sign in to continue your journey ✈️
            </p>

            <div className="space-y-4">
              <div>
                <label className="label-text-white">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="input-dark"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <div>
                <label className="label-text-white">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Your password"
                    className="input-dark pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => { SFX.toggle(); setShowPwd((s) => !s); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors text-lg"
                    tabIndex={-1}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-500/15 border border-red-400/25 text-red-200 rounded-xl px-4 py-3 text-sm animate-fade-in">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}

              <button
                id="login-btn"
                onClick={handleLogin}
                disabled={loading}
                className="w-full btn-primary-white py-3.5 text-base mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in →"}
              </button>
            </div>

            <p className="text-center text-sm text-white/45 mt-5">
              New here?{" "}
              <button
                onClick={() => { SFX.nav(); navigate("/register"); }}
                className="text-brand-300 font-semibold hover:text-white transition-colors"
              >
                Create an account
              </button>
            </p>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/12" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-white/30" style={{ background: "transparent" }}>OR</span>
              </div>
            </div>

            <button
              onClick={() => { SFX.nav(); navigate("/admin-login"); }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white transition-all border border-white/15 hover:border-white/30 hover:bg-white/08"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              🔐 Admin Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}