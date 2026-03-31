import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/travel-bg.jpeg";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Admin users go directly to the full Admin Dashboard
  useEffect(() => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    }
  }, [role, navigate]);

  // While redirect is in-flight for admin
  if (role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 animate-pulse">Redirecting to Admin Dashboard...</p>
      </div>
    );
  }

  // ================= USER DASHBOARD =================
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Wanderlust
        </h1>

        <p className="text-gray-600 mb-6">
          Explore the world, one trip at a time ✈️
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate("/book-trip")}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            Book Trip
          </button>

          <button
            onClick={() => navigate("/my-trips")}
            className="bg-white border px-6 py-3 rounded hover:bg-gray-100"
          >
            My Trips
          </button>

          <button
            onClick={() => navigate("/my-wishlist")}
            className="bg-pink-500 text-white px-6 py-3 rounded hover:bg-pink-600"
          >
            ❤️ My Wishlist
          </button>

          <button
            onClick={() => navigate("/explore")}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            🗺️ Explore Places
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}