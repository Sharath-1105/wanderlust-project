import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/admin-login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name || "Admin");
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #2e1065 100%)" }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-700/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🌍</div>
          <div>
            <p className="font-bold text-white text-xl tracking-tight">Wanderlust</p>
            <p className="text-white/50 text-xs">Admin Portal</p>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white text-center mb-1">Admin Login</h2>
        <p className="text-white/50 text-sm text-center mb-7">Restricted access — admins only</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Email address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@wanderlust.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="Your password"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            id="admin-login-btn"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-white text-brand-700 font-bold py-3 rounded-xl transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4 text-brand-700" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : "🔐 Sign in as Admin"}
          </button>
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Not an admin?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-white font-semibold hover:underline"
          >
            Back to user login
          </button>
        </p>
      </div>
    </div>
  );
}