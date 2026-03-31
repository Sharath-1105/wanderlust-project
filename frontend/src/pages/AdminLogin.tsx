import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/admin-login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-xl w-80 text-center">

        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>

        <input
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded mb-3"
        >
          Login as Admin
        </button>

        <p
          className="text-blue-500 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Back to User Login
        </p>
      </div>
    </div>
  );
}