import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [analytics, setAnalytics] = useState<any>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 🔹 Fetch analytics (admin only)
  useEffect(() => {
    if (role === "admin") {
      fetchAnalytics();
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/admin/analytics");
      setAnalytics(res.data);
    } catch (err) {
      alert("Error fetching analytics");
    }
  };

  // ================= ADMIN DASHBOARD =================
  if (role === "admin") {
    return (
      <div
        className="min-h-screen bg-cover bg-center p-6"
        style={{ backgroundImage: `url(${bg})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* 📊 ANALYTICS CARDS */}
          {analytics && (
            <div className="grid grid-cols-2 gap-6 mb-10">

              <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow text-center text-black">
                <h2 className="text-lg font-semibold">Total Users</h2>
                <p className="text-3xl font-bold mt-2">
                  {analytics.totalUsers}
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow text-center text-black">
                <h2 className="text-lg font-semibold">Total Trips</h2>
                <p className="text-3xl font-bold mt-2">
                  {analytics.totalTrips}
                </p>
              </div>

            </div>
          )}

          {/* ➕ ADD PLACE SECTION */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow w-full max-w-md text-black">
            <h2 className="text-xl font-bold mb-4">Add New Place</h2>

            <input
              placeholder="Place Name"
              className="w-full p-2 border rounded mb-3"
            />

            <input
              placeholder="State"
              className="w-full p-2 border rounded mb-3"
            />

            <input
              placeholder="District"
              className="w-full p-2 border rounded mb-3"
            />

            <input
              placeholder="Entry Fee"
              className="w-full p-2 border rounded mb-3"
            />

            <input
              placeholder="Transport Cost"
              className="w-full p-2 border rounded mb-3"
            />

            <button className="bg-black text-white w-full p-2 rounded hover:bg-gray-800 transition">
              Add Place
            </button>
          </div>
        </div>
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

        <div className="flex gap-4 justify-center">
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