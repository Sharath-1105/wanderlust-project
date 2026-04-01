import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips");
      setTrips(res.data);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Error fetching trips. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === "upcoming") return "text-blue-600";
    if (status === "ongoing") return "text-green-600";
    return "text-gray-500";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Trips</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white border border-white px-4 py-2 rounded hover:bg-white/20 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => { localStorage.clear(); navigate("/"); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="text-white text-center">Loading trips...</p>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/90 text-white px-5 py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-white text-center bg-white/10 rounded-2xl p-10">
            <p className="text-xl mb-4">No trips booked yet!</p>
            <button
              onClick={() => navigate("/book-trip")}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Book Your First Trip
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {trips.map((trip) => (
            <div key={trip._id} className="bg-white/90 p-6 rounded-2xl shadow">

              <h2 className="text-xl font-bold mb-3">
                Trip Summary
              </h2>

              <p><b>Days:</b> {trip.days}</p>
              <p><b>Persons:</b> {trip.persons}</p>
              <p><b>Total Cost:</b> ₹{trip.totalCost}</p>

              <p>
                <b>Status:</b>{" "}
                <span className={statusColor(trip.status)}>
                  {trip.status}
                </span>
              </p>

              <p><b>Start:</b> {trip.startDate ? new Date(trip.startDate).toDateString() : "-"}</p>
              <p><b>End:</b> {trip.endDate ? new Date(trip.endDate).toDateString() : "-"}</p>

              {/* ✅ PLACES — entry fee & transport always shown */}
              <h3 className="font-semibold mt-4 mb-2">Places:</h3>

              <ul className="list-disc ml-5 space-y-2">
                {(trip.places || []).map((place: any, i: number) => (
                  <li key={i}>
                    <b>{place.name}</b>
                    <div className="text-sm text-gray-600">
                      Entry Fee: ₹{place.entryFee} | Transport: ₹{place.transportCost}
                    </div>
                    {place.district && (
                      <div className="text-xs text-gray-400">
                        {place.district}, {place.state}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}