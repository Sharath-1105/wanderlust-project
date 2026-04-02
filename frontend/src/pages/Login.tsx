import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name || "User");
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Hero Panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-12 text-white"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-brand-800/60 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl">
              🌍
            </div>
            <span className="text-2xl font-bold tracking-tight">Wanderlust</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Explore India,<br />
            <span className="text-brand-300">one adventure at a time.</span>
          </h1>
          <p className="text-white/70 text-base max-w-sm">
            Plan, book, and experience the best of Indian travel — powered by AI.
          </p>
          <div className="mt-8 flex gap-6 text-sm text-white/60">
            <div><span className="font-bold text-white text-lg">500+</span><br />Destinations</div>
            <div><span className="font-bold text-white text-lg">AI</span><br />Trip Planner</div>
            <div><span className="font-bold text-white text-lg">₹</span><br />Best Prices</div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-lg">
              🌍
            </div>
            <span className="text-xl font-bold text-slate-800">
              Wander<span className="text-brand-500">lust</span>
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to continue your journey</p>

          <div className="space-y-4">
            <div>
              <label className="label-text">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Your password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              id="login-btn"
              onClick={handleLogin}
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            New here?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-brand-600 font-semibold hover:underline"
            >
              Create an account
            </button>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 bg-[#F8FAFC] px-3">
              OR
            </div>
          </div>

          <button
            onClick={() => navigate("/admin-login")}
            className="w-full btn-secondary py-2.5 text-sm"
          >
            🔐 Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}