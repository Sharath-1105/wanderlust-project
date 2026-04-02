import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      await API.post("/auth/register", { name, email, password });
      alert("Registered successfully ✅");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error registering");
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
            Your journey<br />
            <span className="text-brand-300">starts here.</span>
          </h1>
          <p className="text-white/70 text-base max-w-sm">
            Join thousands of explorers discovering India's most beautiful destinations.
          </p>
          <ul className="mt-8 space-y-3 text-white/80 text-sm">
            {["AI-powered trip planning", "Real-time cost breakdown", "Curated destinations"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-400/30 flex items-center justify-center text-brand-300 text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
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

          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-8">Start your travel story today</p>

          <div className="space-y-4">
            <div>
              <label className="label-text">Full name</label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                className="input-field"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Email address</label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                className="input-field"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Choose a strong password"
                className="input-field"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              />
            </div>

            <button
              id="register-btn"
              onClick={handleRegister}
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating account...
                </span>
              ) : "Create account"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-brand-600 font-semibold hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}