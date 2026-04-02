import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import TripMap from "../components/TripMap";
import TripTimeline from "../components/TripTimeline";

const STATUS_CONFIG: Record<string, { label: string; dot: string; chip: string }> = {
  upcoming:  { label: "Upcoming",  dot: "bg-brand-500",  chip: "bg-brand-50 text-brand-700" },
  ongoing:   { label: "Ongoing",   dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
  completed: { label: "Completed", dot: "bg-slate-400",  chip: "bg-slate-100 text-slate-600" },
};

const TYPE_EMOJIS: Record<string, string> = {
  Beach: "🏖️", Hill: "⛰️", City: "🌆", Forest: "🌿", Heritage: "🏛️", Other: "📍",
};

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-24 rounded-lg" />
          <div className="skeleton h-6 w-48 rounded-lg" />
        </div>
        <div className="skeleton h-16 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMap, setOpenMap] = useState<string | null>(null);
  const [openTimeline, setOpenTimeline] = useState<string | null>(null);
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  useEffect(() => { fetchTrips(); }, []);

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
    setOpenTimeline(null);
  };

  const toggleTimeline = (tripId: string) => {
    setOpenTimeline((prev) => (prev === tripId ? null : tripId));
    setOpenMap(null);
  };

  const toggleExpand = (tripId: string) =>
    setExpandedTrip((prev) => (prev === tripId ? null : tripId));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="My Trips" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1">My Trips</h1>
          <p className="text-slate-500 text-sm">Track all your booked adventures in one place</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-5">
            {[1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-6 border-red-200 bg-red-50 text-red-700 text-center animate-fade-in">
            <p className="text-3xl mb-2">😕</p>
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && trips.length === 0 && (
          <div className="card p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No trips booked yet!</h3>
            <p className="text-slate-500 text-sm mb-8">Start exploring India — one destination at a time</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate("/book-trip")} className="btn-primary px-6 py-2.5">
                📋 Book a Trip
              </button>
              <button onClick={() => navigate("/ai-trip")} className="btn-secondary px-6 py-2.5">
                🤖 AI Planner
              </button>
            </div>
          </div>
        )}

        {/* Trip Cards */}
        <div className="space-y-6">
          {trips.map((trip, idx) => {
            const cfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.upcoming;
            const places = trip.places || [];
            const isMapOpen = openMap === trip._id;
            const isTimelineOpen = openTimeline === trip._id;
            const isExpanded = expandedTrip === trip._id;

            return (
              <div
                key={trip._id}
                className="card overflow-hidden animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="p-6 pb-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.chip}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-800">Trip Summary</h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {trip.startDate ? new Date(trip.startDate).toDateString() : "Date TBD"}
                        {trip.endDate ? ` → ${new Date(trip.endDate).toDateString()}` : ""}
                      </p>
                    </div>
                    {/* Cost badge */}
                    <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white px-5 py-3 rounded-2xl text-center flex-shrink-0 shadow-md">
                      <p className="text-xs opacity-75 mb-0.5">Total Cost</p>
                      <p className="text-2xl font-extrabold tabular-nums">
                        ₹{trip.totalCost?.toLocaleString() || 0}
                      </p>
                      {trip.persons > 1 && trip.totalCost > 0 && (
                        <p className="text-xs opacity-60 mt-0.5">
                          ₹{Math.round(trip.totalCost / trip.persons).toLocaleString()}/person
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Transport strip */}
                  {(trip.fromLocation || trip.transport) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.fromLocation && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1">
                          📌 From: <b className="text-slate-800">{trip.fromLocation}</b>
                        </span>
                      )}
                      {trip.transport && (
                        <span className="text-xs bg-brand-50 text-brand-700 px-3 py-1 rounded-full flex items-center gap-1">
                          {trip.transport === "Car" ? "🚗" : trip.transport === "Bus" ? "🚌" : "🚂"} {trip.transport}
                          {trip.distance > 0 && ` · ${trip.distance} km`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { icon: "📅", label: "Days", value: trip.days },
                      { icon: "👥", label: "Persons", value: trip.persons },
                      { icon: "📍", label: "Places", value: places.length },
                    ].map((s) => (
                      <div key={s.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                        <p className="text-xl">{s.icon}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                        <p className="font-bold text-slate-800">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Cost breakdown row */}
                  {(trip.placeCost > 0 || trip.transportCost > 0 || trip.foodCost > 0) && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "🎟", label: "Places", value: trip.placeCost },
                        { icon: "🚌", label: "Transport", value: trip.transportCost },
                        { icon: "🍽", label: "Food", value: trip.foodCost },
                      ].map((c) => (
                        <div key={c.label} className="bg-brand-50 rounded-xl p-2.5 text-center">
                          <p className="text-base">{c.icon}</p>
                          <p className="text-xs text-brand-400">{c.label}</p>
                          <p className="font-bold text-brand-700 text-sm tabular-nums">
                            ₹{(c.value || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Places list */}
                  {places.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">📍 Places</p>
                      <div className="space-y-2">
                        {(isExpanded ? places : places.slice(0, 3)).map((place: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
                            <span className="text-lg flex-shrink-0">{TYPE_EMOJIS[place.type] || "📍"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{place.name}</p>
                              {(place.district || place.state) && (
                                <p className="text-xs text-slate-400 truncate">
                                  {[place.district, place.state].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 text-xs text-slate-500 space-y-0.5">
                              <p>🎟 ₹{place.entryFee || 0}</p>
                              <p>🚌 ₹{place.transportCost || 0}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {places.length > 3 && (
                        <button
                          onClick={() => toggleExpand(trip._id)}
                          className="mt-2 text-xs text-brand-600 hover:underline font-medium"
                        >
                          {isExpanded ? "▲ Show less" : `▼ Show ${places.length - 3} more place${places.length - 3 > 1 ? "s" : ""}`}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-6 pb-4 flex gap-2 flex-wrap border-t border-slate-100 pt-4">
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

                  <button
                    id={`view-map-btn-${trip._id}`}
                    onClick={() => toggleMap(trip._id)}
                    className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      isMapOpen
                        ? "bg-brand-600 text-white shadow-md"
                        : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                    }`}
                  >
                    🗺️ {isMapOpen ? "Hide Map" : "View on Map"}
                  </button>

                  <button
                    onClick={() => navigate("/book-trip")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-semibold text-sm transition"
                  >
                    ➕ Book Similar
                  </button>
                </div>

                {/* Map section */}
                {isMapOpen && places.length > 0 && (
                  <div className="px-6 pb-6 border-t border-slate-100 pt-4 animate-fade-in">
                    <TripMap
                      places={places}
                      tripTitle={`Trip on ${trip.startDate ? new Date(trip.startDate).toDateString() : "—"}`}
                    />
                  </div>
                )}
                {isMapOpen && places.length === 0 && (
                  <div className="px-6 pb-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-400 animate-fade-in">
                    No places recorded for this trip.
                  </div>
                )}

                {/* Timeline section */}
                {isTimelineOpen && (
                  <div className="px-6 pb-6 border-t border-slate-100 pt-4 animate-fade-in">
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