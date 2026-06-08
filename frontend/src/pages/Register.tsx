import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";
import { SFX } from "../hooks/useSound";
import SoundToggle from "../components/SoundToggle";

const FEATURES = [
  { icon: "🤖", text: "AI-powered trip planning" },
  { icon: "📊", text: "Real-time cost breakdown" },
  { icon: "🗺️", text: "Curated Indian destinations" },
  { icon: "🗓️", text: "Interactive map & timeline" },
];

export default function Register() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email || !password) {
      setError("Please fill in all fields.");
      SFX.error();
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      SFX.error();
      return;
    }
    try {
      setLoading(true);
      SFX.click();
      await API.post("/auth/register", { name, email, password });
      SFX.success();
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err: any) {
      SFX.error();
      setError(err.response?.data?.msg || "Error registering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background with slow zoom */}
      <div
        className="absolute inset-0 animate-zoom-bg"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          transformOrigin: "center center",
        }}
      />
      <div className="absolute inset-0 bg-black/45" />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 60%)",
          animation: "glowPulse 5s ease-in-out infinite",
        }}
      />

      {/* Sound toggle */}
      <div className="absolute top-5 right-5 z-50">
        <SoundToggle dark />
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20 py-12">

        {/* LEFT: Hero */}
        <div className="hidden lg:flex flex-col flex-1 text-white max-w-lg animate-fade-in">
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
            Your journey
            <br />
            <span className="gradient-text-hero">starts here.</span>
          </h1>
          <p className="text-white/65 text-lg max-w-sm leading-relaxed mb-10">
            Join thousands of explorers discovering India's most breathtaking destinations.
          </p>

          <ul className="space-y-3 stagger-children">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-white/80 text-sm">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Form card */}
        <div className="glass-login-card w-full max-w-[400px] p-8 sm:p-10 animate-slide-right flex-shrink-0">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg border border-white/20">
              🌍
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">Wanderlust</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Create account</h2>
          <p className="text-white/50 text-sm mb-7">Start your travel story today 🌏</p>

          {success && (
            <div className="flex items-center gap-2 bg-green-500/15 border border-green-400/25 text-green-200 rounded-xl px-4 py-3 text-sm mb-4 animate-fade-in">
              ✅ Account created! Redirecting to login...
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label-text-white">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                className="input-dark"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text-white">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text-white">Password</label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="input-dark pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
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

            {error && (
              <div className="flex items-start gap-2 bg-red-500/15 border border-red-400/25 text-red-200 rounded-xl px-4 py-3 text-sm animate-fade-in">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                {error}
              </div>
            )}

            <button
              id="register-btn"
              onClick={handleRegister}
              disabled={loading || success}
              className="w-full btn-primary-white py-3.5 text-base mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create account →"}
            </button>
          </div>

          <p className="text-center text-sm text-white/45 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => { SFX.nav(); navigate("/"); }}
              className="text-brand-300 font-semibold hover:text-white transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}