import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";
import TripMap from "../components/TripMap";
import TripTimeline from "../components/TripTimeline";

// ─── Status helpers ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; dot: string; chip: string }> = {
  upcoming:  { label: "Upcoming",  dot: "bg-blue-500",   chip: "bg-blue-100 text-blue-700"   },
  ongoing:   { label: "Ongoing",   dot: "bg-green-500",  chip: "bg-green-100 text-green-700"  },
  completed: { label: "Completed", dot: "bg-gray-400",   chip: "bg-gray-100 text-gray-600"   },
};

const TYPE_EMOJIS: Record<string, string> = {
  Beach: "🏖️", Hill: "⛰️", City: "🌆", Forest: "🌿", Heritage: "🏛️", Other: "📍",
};

export default function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMap, setOpenMap] = useState<string | null>(null);
  const [openTimeline, setOpenTimeline] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

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

  const toggleMap = (tripId: string) => {
    setOpenMap((prev) => (prev === tripId ? null : tripId));
    setOpenTimeline(null); // close timeline when map opens
  };

  const toggleTimeline = (tripId: string) => {
    setOpenTimeline((prev) => (prev === tripId ? null : tripId));
    setOpenMap(null); // close map when timeline opens
  };

  const toggleExpand = (tripId: string) =>
    setExpandedTrip((prev) => (prev === tripId ? null : tripId));

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-black/60 backdrop-blur-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white text-sm hover:underline"
        >
          ← Dashboard
        </button>
        <span className="text-white font-semibold tracking-wide">🧳 My Trips</span>
        <button
          onClick={() => { localStorage.clear(); navigate("/"); }}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded transition"
        >
          Logout
        </button>
      </div>

      <div className="relative z-10 pt-24 pb-12 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2">My Trips</h1>
          <p className="text-white/60 text-sm">Track all your booked adventures in one place</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/20 animate-pulse rounded-2xl h-48" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/90 text-white px-5 py-4 rounded-2xl text-center mb-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && trips.length === 0 && (
          <div className="text-center bg-white/10 backdrop-blur rounded-2xl p-12 border border-white/20">
            <div className="text-5xl mb-4">✈️</div>
            <p className="text-white text-xl font-bold mb-2">No trips booked yet!</p>
            <p className="text-white/60 text-sm mb-6">Start exploring India — one destination at a time.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/book-trip")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                📋 Book a Trip
              </button>
              <button
                onClick={() => navigate("/ai-trip")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition"
              >
                🤖 AI Planner
              </button>
            </div>
          </div>
        )}

        {/* Trip Cards */}
        <div className="space-y-6">
          {trips.map((trip) => {
            const cfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.upcoming;
            const places = trip.places || [];
            const isMapOpen = openMap === trip._id;
            const isTimelineOpen = openTimeline === trip._id;
            const isExpanded = expandedTrip === trip._id;

            return (
              <div
                key={trip._id}
                className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.chip}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-800">Trip Summary</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {trip.startDate ? new Date(trip.startDate).toDateString() : "Date TBD"}
                        {trip.endDate ? ` → ${new Date(trip.endDate).toDateString()}` : ""}
                      </p>
                    </div>
                    {/* Cost badge */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-4 py-3 rounded-xl text-center flex-shrink-0">
                      <p className="text-xs opacity-80">Total Cost</p>
                      <p className="text-xl font-extrabold">₹{trip.totalCost?.toLocaleString() || 0}</p>
                      {trip.persons > 1 && trip.totalCost > 0 && (
                        <p className="text-xs opacity-70 mt-0.5">
                          ₹{Math.round(trip.totalCost / trip.persons).toLocaleString()}/person
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transport info strip */}
                  {(trip.fromLocation || trip.transport) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.fromLocation && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                          📌 From: <b className="text-gray-800">{trip.fromLocation}</b>
                        </span>
                      )}
                      {trip.transport && (
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full flex items-center gap-1">
                          {trip.transport === "Car" ? "🚗" : trip.transport === "Bus" ? "🚌" : "🚂"} {trip.transport}
                          {trip.distance > 0 && ` · ${trip.distance} km`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { icon: "📅", label: "Days", value: trip.days },
                      { icon: "👥", label: "Persons", value: trip.persons },
                      { icon: "📍", label: "Places", value: places.length },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-lg">{s.icon}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                        <p className="font-bold text-gray-800">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Cost breakdown row — shows for new trips with itemised costs */}
                  {(trip.placeCost > 0 || trip.transportCost > 0 || trip.foodCost > 0) && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "🎟", label: "Places",    value: trip.placeCost     },
                        { icon: "🚌", label: "Transport", value: trip.transportCost },
                        { icon: "🍽", label: "Food",      value: trip.foodCost      },
                      ].map(c => (
                        <div key={c.label} className="bg-indigo-50/60 rounded-xl p-2.5 text-center">
                          <p className="text-base">{c.icon}</p>
                          <p className="text-xs text-indigo-400">{c.label}</p>
                          <p className="font-bold text-indigo-700 text-sm">₹{(c.value || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Places list */}
                  {places.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        📍 Places
                      </p>
                      <div className="space-y-2">
                        {(isExpanded ? places : places.slice(0, 3)).map((place: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5"
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">
                              {TYPE_EMOJIS[place.type] || "📍"}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{place.name}</p>
                              {(place.district || place.state) && (
                                <p className="text-xs text-gray-400 truncate">
                                  {[place.district, place.state].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 text-xs text-gray-500 space-y-0.5">
                              <p>🎟 ₹{place.entryFee || 0}</p>
                              <p>🚌 ₹{place.transportCost || 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {places.length > 3 && (
                        <button
                          onClick={() => toggleExpand(trip._id)}
                          className="mt-2 text-xs text-indigo-600 hover:underline"
                        >
                          {isExpanded
                            ? "▲ Show less"
                            : `▼ Show ${places.length - 3} more place${places.length - 3 > 1 ? "s" : ""}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-6 pb-4 flex gap-2 flex-wrap">
                  {/* Timeline toggle */}
                  <button
                    id={`view-timeline-btn-${trip._id}`}
                    onClick={() => toggleTimeline(trip._id)}
                    className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isTimelineOpen
                        ? "bg-violet-600 text-white shadow-md"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
                    }`}
                  >
                    📅 {isTimelineOpen ? "Hide Timeline" : "Day Timeline"}
                  </button>

                  {/* Map toggle */}
                  <button
                    id={`view-map-btn-${trip._id}`}
                    onClick={() => toggleMap(trip._id)}
                    className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isMapOpen
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                    }`}
                  >
                    🗺️ {isMapOpen ? "Hide Map" : "View on Map"}
                  </button>

                  <button
                    onClick={() => navigate("/book-trip")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl font-semibold text-sm transition"
                  >
                    ➕ Book Similar
                  </button>
                </div>

                {/* Map section */}
                {isMapOpen && places.length > 0 && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <TripMap
                      places={places}
                      tripTitle={`Trip on ${trip.startDate ? new Date(trip.startDate).toDateString() : "—"}`}
                    />
                  </div>
                )}

                {isMapOpen && places.length === 0 && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
                    No places recorded for this trip.
                  </div>
                )}

                {/* Timeline section */}
                {isTimelineOpen && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <TripTimeline
                      places={places}
                      days={trip.days || 1}
                      startDate={trip.startDate}
                      persons={trip.persons || 1}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}