import { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import bg from "../assets/travel-bg.jpeg";

// ─── Shared cost constants (mirrors backend costUtils.js) ────
const TRANSPORT_RATES: Record<string, number> = { Car: 10, Bus: 5, Train: 7 };
const FOOD_RATE = 150;
const MEALS_PER_DAY = 3;

function calcCosts(places: any[], days: number, persons: number, transport: string, distance: number) {
  const d = Math.max(1, days);
  const p = Math.max(1, persons);
  const km = Math.max(0, distance);
  const placeCost     = places.reduce((s, pl) => s + (Number(pl.entryFee) || 0), 0) * p;
  const transportCost = (TRANSPORT_RATES[transport] || 0) * km * p * 2;
  const foodCost      = MEALS_PER_DAY * FOOD_RATE * d * p;
  return { placeCost, transportCost, foodCost, totalCost: placeCost + transportCost + foodCost };
}

// ─── Transport option config ───────────────────────────────────
const TRANSPORT_OPTIONS = [
  { value: "",      label: "No vehicle / Self-arranged", icon: "🚶", rate: null },
  { value: "Bus",   label: "Bus",                        icon: "🚌", rate: 5    },
  { value: "Train", label: "Train",                      icon: "🚂", rate: 7    },
  { value: "Car",   label: "Car / Cab",                  icon: "🚗", rate: 10   },
];

// ─── Mini cost row component ─────────────────────────────────
function CostRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${highlight ? "border-t border-indigo-100 mt-1 pt-2" : ""}`}>
      <span className={`text-sm ${highlight ? "font-extrabold text-indigo-900" : "text-gray-600"}`}>{label}</span>
      <span className={`font-bold tabular-nums ${highlight ? "text-indigo-700 text-base" : "text-gray-800"}`}>
        ₹{value.toLocaleString()}
      </span>
    </div>
  );
}

export default function BookTrip() {
  const navigate = useNavigate();

  // ── Form state ──────────────────────────────────────────────
  const [days,         setDays]         = useState("");
  const [persons,      setPersons]      = useState("");
  const [startDate,    setStartDate]    = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [transport,    setTransport]    = useState("");
  const [distance,     setDistance]     = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);

  // ── Data state ──────────────────────────────────────────────
  const [placesData,   setPlacesData]   = useState<any[]>([]);
  const [wishlistIds,  setWishlistIds]  = useState<string[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [filterType,   setFilterType]   = useState("All");

  // ── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([fetchPlaces(), fetchWishlist()]);
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await API.get("/places");
      setPlacesData(res.data);
    } catch { showToast("Error loading places", "error"); }
    finally { setLoading(false); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlistIds(res.data.map((p: any) => p._id));
    } catch {}
  };

  const toggleWishlist = async (e: React.MouseEvent, place: any) => {
    e.preventDefault(); e.stopPropagation();
    const isSaved = wishlistIds.includes(place._id);
    try {
      if (isSaved) {
        await API.delete(`/wishlist/remove/${place._id}`);
        setWishlistIds(prev => prev.filter(id => id !== place._id));
        showToast("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add/${place._id}`);
        setWishlistIds(prev => [...prev, place._id]);
        showToast("Added to wishlist ❤️");
      }
    } catch { showToast("Wishlist error", "error"); }
  };

  const handleSelect = (place: any) => {
    const n  = Number(days) || 1;
    const already = selectedPlaces.find(p => p._id === place._id || p.name === place.name);
    if (already) {
      setSelectedPlaces(prev => prev.filter(p => p.name !== place.name));
    } else if (selectedPlaces.length >= n * 3) {
      showToast(`Max ${n * 3} places for ${n} day(s)`, "error");
    } else {
      setSelectedPlaces(prev => [...prev, place]);
    }
  };

  // ── Live cost calculation ────────────────────────────────────
  const costs = useMemo(() =>
    calcCosts(
      selectedPlaces,
      Number(days) || 1,
      Number(persons) || 1,
      transport,
      Number(distance) || 0
    ),
    [selectedPlaces, days, persons, transport, distance]
  );

  // ── Filtered places list ─────────────────────────────────────
  const types = ["All", ...Array.from(new Set(placesData.map(p => p.type).filter(Boolean)))];
  const filteredPlaces = filterType === "All"
    ? placesData
    : placesData.filter(p => p.type === filterType);

  const handleSubmit = async () => {
    if (!days || Number(days) < 1)     return showToast("Enter number of days", "error");
    if (!persons || Number(persons) < 1) return showToast("Enter number of persons", "error");
    if (!startDate)                    return showToast("Select a start date", "error");
    if (selectedPlaces.length === 0)   return showToast("Select at least one place", "error");
    if (transport && (!distance || Number(distance) < 1))
      return showToast("Enter estimated distance for transport cost", "error");

    setSubmitting(true);
    try {
      await API.post("/trips", {
        places: selectedPlaces,
        days,
        persons,
        startDate,
        fromLocation,
        transport,
        distance: Number(distance) || 0,
      });
      showToast("Trip Booked Successfully! 🎉");
      setTimeout(() => navigate("/my-trips"), 1500);
    } catch (err: any) {
      showToast(err?.response?.data?.msg || "Error booking trip", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const PLACE_TYPE_EMOJI: Record<string, string> = {
    Beach: "🏖️", Hill: "⛰️", City: "🌆", Forest: "🌿", Heritage: "🏛️", Other: "📍",
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/55" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm animate-bounce ${
          toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-black/60 backdrop-blur-sm">
        <button onClick={() => navigate("/dashboard")} className="text-white text-sm hover:underline">
          ← Dashboard
        </button>
        <span className="text-white font-semibold tracking-wide">🗺️ Book a Trip</span>
        <div className="flex gap-3">
          <button onClick={() => navigate("/my-wishlist")} className="text-white text-sm hover:underline">❤️ Wishlist</button>
          <button onClick={() => { localStorage.clear(); navigate("/"); }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded transition">Logout</button>
        </div>
      </div>

      <div className="relative z-10 pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Plan Your Trip</h1>
          <p className="text-white/60 text-sm">Select places, set your travel details, and see the full cost breakdown live.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Form + Places ───────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Trip Details Card */}
            <div className="bg-white/95 rounded-2xl shadow-xl p-6">
              <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                📋 Trip Details
              </h2>
              <div className="grid grid-cols-2 gap-4">

                {/* From Location */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">From (your city)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bangalore, Mumbai..."
                    value={fromLocation}
                    onChange={e => setFromLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Days */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Days *</label>
                  <input type="number" min="1" placeholder="e.g. 3"
                    value={days} onChange={e => setDays(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Persons */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Persons *</label>
                  <input type="number" min="1" placeholder="e.g. 2"
                    value={persons} onChange={e => setPersons(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Start Date */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Transport Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRANSPORT_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setTransport(opt.value)}
                      className={`flex flex-col items-center py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                        transport === opt.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-gray-200 hover:border-indigo-300 text-gray-600"
                      }`}>
                      <span className="text-xl mb-0.5">{opt.icon}</span>
                      <span className="text-xs leading-tight text-center">{opt.value || "None"}</span>
                      {opt.rate && <span className="text-xs text-gray-400">₹{opt.rate}/km</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance — only shown when transport is selected */}
              {transport && (
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    Estimated Distance (km, one-way)
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" placeholder="e.g. 250"
                      value={distance} onChange={e => setDistance(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-sm text-gray-400 whitespace-nowrap">km × 2 (return)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Rate: ₹{TRANSPORT_RATES[transport]}/km/person · round-trip included
                  </p>
                </div>
              )}
            </div>

            {/* Places Card */}
            <div className="bg-white/95 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-gray-800 flex items-center gap-2">
                  📍 Select Places
                  {selectedPlaces.length > 0 && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedPlaces.length} selected
                    </span>
                  )}
                </h2>
                {days && (
                  <span className="text-xs text-gray-400">Max: {Number(days) * 3} places</span>
                )}
              </div>

              {/* Type filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {types.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition ${
                      filterType === t
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-indigo-50"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>

              {loading && (
                <div className="grid grid-cols-1 gap-3">
                  {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              )}

              {!loading && filteredPlaces.length === 0 && (
                <p className="text-gray-400 text-sm italic text-center py-6">
                  No places available. Admin needs to add places first.
                </p>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredPlaces.map((place, i) => {
                  const isSelected = !!selectedPlaces.find(p => p.name === place.name);
                  return (
                    <label key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                      }`}>
                      <input type="checkbox" className="mt-1 accent-indigo-600"
                        checked={isSelected} onChange={() => handleSelect(place)} />
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {PLACE_TYPE_EMOJI[place.type] || "📍"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{place.name}</p>
                        {place.district && (
                          <p className="text-xs text-gray-400">{place.district}, {place.state}</p>
                        )}
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>🎟 Entry: <b className="text-gray-700">₹{place.entryFee || 0}</b></span>
                          {place.rating > 0 && (
                            <span>⭐ <b className="text-gray-700">{place.rating}</b></span>
                          )}
                        </div>
                      </div>
                      <button type="button" onClick={e => toggleWishlist(e, place)}
                        className="text-lg flex-shrink-0 hover:scale-125 transition-transform"
                        title={wishlistIds.includes(place._id) ? "Remove from wishlist" : "Add to wishlist"}>
                        {wishlistIds.includes(place._id) ? "❤️" : "🤍"}
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Cost Breakdown (sticky) ───────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">

              {/* Live Cost Card */}
              <div className="bg-white/95 rounded-2xl shadow-xl p-6">
                <h2 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                  💰 Cost Breakdown
                  <span className="text-xs text-indigo-500 font-normal ml-auto">Live</span>
                </h2>

                {/* Summary numbers */}
                <div className="space-y-0.5">
                  <CostRow
                    label={`🎟 Places (${selectedPlaces.length} × ${Number(persons) || 1} person${(Number(persons) || 1) > 1 ? "s" : ""})`}
                    value={costs.placeCost}
                  />
                  <CostRow
                    label={`${transport ? TRANSPORT_OPTIONS.find(o => o.value === transport)?.icon : "🚶"} Transport${transport ? ` (${transport})` : " (none)"}`}
                    value={costs.transportCost}
                  />
                  <CostRow
                    label={`🍽 Food (${Number(days) || 1}d × 3 meals × ₹150 × ${Number(persons) || 1})`}
                    value={costs.foodCost}
                  />
                  <CostRow label="💳 TOTAL" value={costs.totalCost} highlight />
                </div>

                {/* Per-person breakdown */}
                {Number(persons) > 1 && (
                  <div className="mt-3 bg-indigo-50 rounded-xl px-4 py-2.5 text-xs text-indigo-700">
                    Per person: <b>₹{Math.round(costs.totalCost / Number(persons)).toLocaleString()}</b>
                  </div>
                )}

                {/* Formula note */}
                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <p><b>Formula:</b></p>
                  <p>🚗 Car → ₹10/km &nbsp; 🚌 Bus → ₹5/km &nbsp; 🚂 Train → ₹7/km</p>
                  <p>🍽 Food → ₹150/meal × 3 meals/day × days × persons</p>
                  <p>🔄 Distance includes return journey (×2)</p>
                </div>
              </div>

              {/* Selected places summary */}
              {selectedPlaces.length > 0 && (
                <div className="bg-white/95 rounded-2xl shadow-xl p-5">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">✅ Selected Places</h3>
                  <div className="space-y-1.5">
                    {selectedPlaces.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{i+1}. {p.name}</span>
                        <button onClick={() => setSelectedPlaces(prev => prev.filter(x => x.name !== p.name))}
                          className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book button */}
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold rounded-2xl shadow-lg transition-all disabled:opacity-60 text-base">
                {submitting ? "Booking..." : `✅ Book Trip — ₹${costs.totalCost.toLocaleString()}`}
              </button>

              <button onClick={() => navigate("/ai-trip")}
                className="w-full py-2.5 bg-white/80 hover:bg-white text-indigo-700 font-semibold rounded-xl border border-indigo-200 text-sm transition">
                🤖 Try AI Trip Planner instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}