import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg"; // make sure name has no space

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay for better visibility */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Login Card */}
      <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-80 text-center">

        <h1 className="text-3xl font-bold mb-6 text-green-700">
          Wanderlust
        </h1>

        <input
          placeholder="Email"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded mb-3 transition"
        >
          Login
        </button>

        <p
          className="text-blue-500 cursor-pointer mb-2 hover:underline"
          onClick={() => navigate("/register")}
        >
          New here? Register
        </p>

        <button
          onClick={() => navigate("/admin-login")}
          className="w-full border p-2 rounded hover:bg-gray-100 transition"
        >
          Admin Login
        </button>
      </div>
    </div>
  );
}