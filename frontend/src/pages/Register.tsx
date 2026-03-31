import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", { name, email, password });

      alert("Registered successfully ✅");
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error registering");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-green-100">
      <div className="bg-white p-8 rounded shadow w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input
          placeholder="Name"
          className="w-full p-2 border mb-2"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full p-2 border mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Register
        </button>

        <p
          className="text-blue-500 mt-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}