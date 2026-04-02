import { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// ─── Shared cost constants (mirrors backend costUtils.js) ────
const TRANSPORT_RATES: Record<string, number> = { Car: 10, Bus: 5, Train: 7 };
const FOOD_RATE = 150;
const MEALS_PER_DAY = 3;

function calcCosts(places: any[], days: number, persons: number, transport: string, distance: number) {
  const d = Math.max(1, days);
  const p = Math.max(1, persons);
  const km = Math.max(0, distance);
  const placeCost = places.reduce((s, pl) => s + (Number(pl.entryFee) || 0), 0) * p;
  const transportCost = (TRANSPORT_RATES[transport] || 0) * km * p * 2;
  const foodCost = MEALS_PER_DAY * FOOD_RATE * d * p;
  return { placeCost, transportCost, foodCost, totalCost: placeCost + transportCost + foodCost };
}

const TRANSPORT_OPTIONS = [
  { value: "", label: "None", icon: "🚶", rate: null },
  { value: "Bus", label: "Bus", icon: "🚌", rate: 5 },
  { value: "Train", label: "Train", icon: "🚂", rate: 7 },
  { value: "Car", label: "Car", icon: "🚗", rate: 10 },
];

const PLACE_TYPE_EMOJI: Record<string, string> = {
  Beach: "🏖️", Hill: "⛰️", City: "🌆", Forest: "🌿", Heritage: "🏛️", Other: "📍",
};

function SkeletonRow() {
  return (
    <div className="skeleton h-20 rounded-xl" />
  );
}

export default function BookTrip() {
  const navigate = useNavigate();
  const [days, setDays] = useState("");
  const [persons, setPersons] = useState("");
  const [startDate, setStartDate] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [transport, setTransport] = useState("");
  const [distance, setDistance] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [placesData, setPlacesData] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("All");
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
        setWishlistIds((prev) => prev.filter((id) => id !== place._id));
        showToast("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add/${place._id}`);
        setWishlistIds((prev) => [...prev, place._id]);
        showToast("Saved to wishlist ❤️");
      }
    } catch { showToast("Wishlist error", "error"); }
  };

  const handleSelect = (place: any) => {
    const n = Number(days) || 1;
    const already = selectedPlaces.find((p) => p._id === place._id || p.name === place.name);
    if (already) {
      setSelectedPlaces((prev) => prev.filter((p) => p.name !== place.name));
    } else if (selectedPlaces.length >= n * 3) {
      showToast(`Max ${n * 3} places for ${n} day(s)`, "error");
    } else {
      setSelectedPlaces((prev) => [...prev, place]);
    }
  };

  const costs = useMemo(() => calcCosts(
    selectedPlaces, Number(days) || 1, Number(persons) || 1, transport, Number(distance) || 0
  ), [selectedPlaces, days, persons, transport, distance]);

  const types = ["All", ...Array.from(new Set(placesData.map((p) => p.type).filter(Boolean)))];
  const filteredPlaces = filterType === "All" ? placesData : placesData.filter((p) => p.type === filterType);

  const handleSubmit = async () => {
    if (!days || Number(days) < 1) return showToast("Enter number of days", "error");
    if (!persons || Number(persons) < 1) return showToast("Enter number of persons", "error");
    if (!startDate) return showToast("Select a start date", "error");
    if (selectedPlaces.length === 0) return showToast("Select at least one place", "error");
    if (transport && (!distance || Number(distance) < 1))
      return showToast("Enter estimated distance for transport cost", "error");

    setSubmitting(true);
    try {
      await API.post("/trips", {
        places: selectedPlaces, days, persons, startDate, fromLocation,
        transport, distance: Number(distance) || 0,
      });
      showToast("Trip Booked Successfully! 🎉");
      setTimeout(() => navigate("/my-trips"), 1500);
    } catch (err: any) {
      showToast(err?.response?.data?.msg || "Error booking trip", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="Book a Trip" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fade-in ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Plan Your Trip</h1>
          <p className="text-slate-500 text-sm">Select places, set travel details, and see the live cost breakdown</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT: Form + Places ─────────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Trip Details Card */}
            <div className="card p-6 animate-fade-in">
              <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">📋</span>
                Trip Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-text">From (your city)</label>
                  <input type="text" placeholder="e.g. Bangalore, Mumbai..."
                    value={fromLocation} onChange={(e) => setFromLocation(e.target.value)}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-text">Days *</label>
                  <input type="number" min="1" placeholder="e.g. 3" value={days}
                    onChange={(e) => setDays(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Persons *</label>
                  <input type="number" min="1" placeholder="e.g. 2" value={persons}
                    onChange={(e) => setPersons(e.target.value)} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="label-text">Start Date *</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="input-field" min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              {/* Transport Mode */}
              <div className="mt-5">
                <label className="label-text mb-2 block">Transport Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setTransport(opt.value)}
                      className={`flex flex-col items-center py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        transport === opt.value
                          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm scale-[1.02]"
                          : "border-slate-200 hover:border-brand-300 text-slate-600"
                      }`}>
                      <span className="text-xl mb-1">{opt.icon}</span>
                      <span className="text-xs">{opt.label}</span>
                      {opt.rate && <span className="text-[10px] text-slate-400">₹{opt.rate}/km</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              {transport && (
                <div className="mt-4 animate-fade-in">
                  <label className="label-text">Distance (km, one-way) *</label>
                  <div className="flex items-center gap-3">
                    <input type="number" min="0" placeholder="e.g. 250" value={distance}
                      onChange={(e) => setDistance(e.target.value)} className="input-field flex-1" />
                    <span className="text-sm text-slate-400 whitespace-nowrap">× 2 (return)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Rate: ₹{TRANSPORT_RATES[transport]}/km/person — round-trip included
                  </p>
                </div>
              )}
            </div>

            {/* Places Card */}
            <div className="card p-6 animate-fade-in" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">📍</span>
                  Select Places
                  {selectedPlaces.length > 0 && (
                    <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                      {selectedPlaces.length}
                    </span>
                  )}
                </h2>
                {days && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                    Max: {Number(days) * 3}
                  </span>
                )}
              </div>

              {/* Type filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {types.map((t) => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                      filterType === t
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                    }`}>
                    {PLACE_TYPE_EMOJI[t] || "🌐"} {t}
                  </button>
                ))}
              </div>

              {/* Skeleton */}
              {loading && (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <SkeletonRow key={i} />)}
                </div>
              )}

              {/* Empty */}
              {!loading && filteredPlaces.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">🗺️</p>
                  <p className="text-sm">No places yet — admin needs to add some</p>
                </div>
              )}

              {/* List */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredPlaces.map((place, i) => {
                  const isSelected = !!selectedPlaces.find((p) => p.name === place.name);
                  return (
                    <label key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-brand-400 bg-brand-50"
                          : "border-slate-100 hover:border-brand-200 hover:bg-slate-50"
                      }`}>
                      <input type="checkbox" className="accent-brand-600 w-4 h-4 flex-shrink-0"
                        checked={isSelected} onChange={() => handleSelect(place)} />
                      <span className="text-xl flex-shrink-0">{PLACE_TYPE_EMOJI[place.type] || "📍"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{place.name}</p>
                        {place.district && (
                          <p className="text-xs text-slate-400">{place.district}, {place.state}</p>
                        )}
                        <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                          <span>🎟 ₹{place.entryFee || 0}</span>
                          {place.rating > 0 && <span>⭐ {place.rating}</span>}
                        </div>
                      </div>
                      <button type="button" onClick={(e) => toggleWishlist(e, place)}
                        className="text-lg flex-shrink-0 hover:scale-110 transition-transform">
                        {wishlistIds.includes(place._id) ? "❤️" : "🤍"}
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Cost Breakdown (sticky) ─────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">

              {/* Cost Card */}
              <div className="card p-6 animate-fade-in" style={{ animationDelay: "120ms" }}>
                <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">💰</span>
                  Cost Breakdown
                  <span className="ml-auto text-xs text-brand-500 font-normal bg-brand-50 px-2 py-0.5 rounded-full">Live</span>
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      icon: "🎟",
                      label: `Places (${selectedPlaces.length} × ${Number(persons) || 1})`,
                      val: costs.placeCost,
                    },
                    {
                      icon: TRANSPORT_OPTIONS.find((o) => o.value === transport)?.icon || "🚶",
                      label: `Transport (${transport || "none"})`,
                      val: costs.transportCost,
                    },
                    {
                      icon: "🍽",
                      label: `Food (${Number(days) || 1}d × 3 meals)`,
                      val: costs.foodCost,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-1.5">
                        {row.icon} {row.label}
                      </span>
                      <span className="font-bold text-slate-700 tabular-nums">₹{row.val.toLocaleString()}</span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-white font-bold">💳 Total</span>
                    <span className="text-white font-extrabold text-xl tabular-nums">
                      ₹{costs.totalCost.toLocaleString()}
                    </span>
                  </div>

                  {Number(persons) > 1 && (
                    <div className="bg-brand-50 rounded-xl px-4 py-2.5 text-xs text-brand-700 text-center">
                      Per person: <b>₹{Math.round(costs.totalCost / Number(persons)).toLocaleString()}</b>
                    </div>
                  )}
                </div>

                {/* Formula */}
                <div className="mt-4 bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-600 mb-1">Formula:</p>
                  <p>🚗 Car ₹10/km · 🚌 Bus ₹5/km · 🚂 Train ₹7/km</p>
                  <p>🍽 ₹150/meal × 3 meals × days × persons</p>
                  <p>🔄 Distance × 2 (return journey)</p>
                </div>
              </div>

              {/* Selected places */}
              {selectedPlaces.length > 0 && (
                <div className="card p-5 animate-fade-in">
                  <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                    ✅ Selected Places
                    <span className="text-xs text-slate-400 ml-auto">{selectedPlaces.length} selected</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedPlaces.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-sm">
                        <span className="text-slate-700 truncate flex-1">
                          {PLACE_TYPE_EMOJI[p.type] || "📍"} {p.name}
                        </span>
                        <button
                          onClick={() => setSelectedPlaces((prev) => prev.filter((x) => x.name !== p.name))}
                          className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0 transition-colors"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full btn-primary py-4 text-base font-bold disabled:opacity-60"
              >
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Booking...</span>
                  : `✅ Book Trip — ₹${costs.totalCost.toLocaleString()}`
                }
              </button>

              <button onClick={() => navigate("/ai-trip")}
                className="w-full btn-secondary py-2.5 text-sm">
                🤖 Try AI Trip Planner instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}