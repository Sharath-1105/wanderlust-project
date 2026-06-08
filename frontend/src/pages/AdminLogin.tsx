import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";
import { SFX } from "../hooks/useSound";
import SoundToggle from "../components/SoundToggle";

export default function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); SFX.error(); return; }
    try {
      setLoading(true);
      SFX.click();
      const res = await API.post("/auth/admin-login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role",  res.data.role);
      localStorage.setItem("name",  res.data.name || "Admin");
      SFX.success();
      navigate("/dashboard");
    } catch (err: any) {
      SFX.error();
      setError(err.response?.data?.msg || "Login failed. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden p-4"
      style={{ minHeight: "100dvh" }}
    >
      {/* Full-screen bg with slow zoom */}
      <div
        className="absolute inset-0 animate-zoom-bg"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          transformOrigin: "center center",
        }}
      />
      {/* Dark overlay — slightly more opaque for admin */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.62)" }} />

      {/* Radial glow — ocean blue */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.28) 0%, transparent 60%)",
          animation: "glowPulse 5s ease-in-out infinite",
        }}
      />

      {/* Sound toggle */}
      <div className="absolute top-5 right-5 z-50">
        <SoundToggle dark />
      </div>

      {/* Card */}
      <div
        className="glass-login-card relative z-10 w-full max-w-sm p-9 animate-slide-up"
      >
        {/* Shield icon */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              boxShadow: "0 8px 28px rgba(14,165,233,0.45)",
            }}
          >
            🔐
          </div>
          <p className="font-extrabold text-white text-xl tracking-tight">Wanderlust</p>
          <p className="text-white/40 text-xs mt-0.5 uppercase tracking-widest">Admin Portal</p>
        </div>

        <h2 className="text-2xl font-extrabold text-white text-center mb-1 tracking-tight">
          Admin Sign In
        </h2>
        <p className="text-white/45 text-sm text-center mb-7">
          Restricted access — authorised personnel only
        </p>

        <div className="space-y-4">
          <div>
            <label className="label-text-white">Email address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@wanderlust.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="input-dark"
            />
          </div>
          <div>
            <label className="label-text-white">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="input-dark"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/15 border border-red-400/25 text-red-200 rounded-xl px-4 py-3 text-sm animate-fade-in">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <button
            id="admin-login-btn"
            onClick={handleLogin}
            disabled={loading}
            className="w-full font-bold py-3.5 rounded-xl text-white transition-all active:scale-[0.97] disabled:opacity-60 mt-1"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              boxShadow: "0 6px 22px rgba(14,165,233,0.4)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : "🔐 Sign in as Admin"}
          </button>
        </div>

        <p className="text-center text-white/40 text-sm mt-7">
          Not an admin?{" "}
          <button
            onClick={() => { SFX.nav(); navigate("/"); }}
            className="text-brand-300 font-semibold hover:text-white transition-colors"
          >
            Back to user login
          </button>
        </p>
      </div>
    </div>
  );
}