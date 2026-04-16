import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import API from "../services/api";
import { fetchRouteDistance, type DistanceLeg } from "../services/distanceApi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LocationSelector from "../components/LocationSelector";

// ─── Shared cost constants (mirrors backend costUtils.js) ────
const TRANSPORT_RATES: Record<string, number> = { Car: 10, Bus: 5, Train: 7 };
const FOOD_RATE = 150;
const MEALS_PER_DAY = 3;

function calcCosts(places: any[], days: number, persons: number, transport: string, distance: number) {
  const d  = Math.max(1, days);
  const p  = Math.max(1, persons);
  const km = Math.max(0, distance);
  const placeCost     = places.reduce((s, pl) => s + (Number(pl.entryFee) || 0), 0) * p;
  const transportCost = (TRANSPORT_RATES[transport] || 0) * km * p;   // one-way (no ×2 — full route already includes return segments)
  const foodCost      = MEALS_PER_DAY * FOOD_RATE * d * p;
  return { placeCost, transportCost, foodCost, totalCost: placeCost + transportCost + foodCost };
}

const TRANSPORT_OPTIONS = [
  { value: "",      label: "None",  icon: "🚶", rate: null },
  { value: "Bus",   label: "Bus",   icon: "🚌", rate: 5   },
  { value: "Train", label: "Train", icon: "🚂", rate: 7   },
  { value: "Car",   label: "Car",   icon: "🚗", rate: 10  },
];

const PLACE_TYPE_EMOJI: Record<string, string> = {
  Beach: "🏖️", Hill: "⛰️", City: "🌆", Forest: "🌿", Heritage: "🏛️", Other: "📍",
};

function SkeletonRow() {
  return <div className="skeleton h-20 rounded-xl" />;
}

// ── Small spinner for inline loading ─────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size }}
      className="animate-spin text-brand-500"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function BookTrip() {
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────
  const [days, setDays]               = useState("");
  const [persons, setPersons]         = useState("");
  const [startDate, setStartDate]     = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [transport, setTransport]     = useState("");

  // ── Data state ────────────────────────────────────────────────
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [placesData, setPlacesData]         = useState<any[]>([]);
  const [wishlistIds, setWishlistIds]       = useState<string[]>([]);
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [filterType, setFilterType]         = useState("All");
  const [toast, setToast]                   = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Distance state ────────────────────────────────────────────
  const [distanceKm, setDistanceKm]         = useState<number | null>(null);
  const [distanceLegs, setDistanceLegs]     = useState<DistanceLeg[]>([]);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError]   = useState("");
  const [distanceFallback, setDistanceFallback] = useState(false);

  // ── Debounce ref for fromLocation / transport changes ─────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ── Auto-calculate distance ────────────────────────────────────
  // Triggers via debounce when fromLocation or transport changes.
  // Manual recalc triggered by Recalculate button when places change.
  const calculateDistance = useCallback(async (from: string, trans: string, places: any[]) => {
    if (!from.trim() || !trans || places.length === 0) {
      setDistanceKm(null);
      setDistanceLegs([]);
      setDistanceError("");
      setDistanceFallback(false);
      return;
    }

    setDistanceLoading(true);
    setDistanceError("");
    setDistanceFallback(false);

    try {
      const placeNames = places.map((p: any) => p.name).filter(Boolean);
      const result = await fetchRouteDistance(from.trim(), placeNames);
      setDistanceKm(result.totalDistanceKm);
      setDistanceLegs(result.legs || []);
      setDistanceFallback(result.fallback || false);
    } catch (err: any) {
      const msg = err?.response?.data?.msg || err?.message || "Could not calculate distance";
      setDistanceError(msg);
      setDistanceKm(null);
    } finally {
      setDistanceLoading(false);
    }
  }, []);

  // ── Debounce: fromLocation / transport changes ─────────────────
  useEffect(() => {
    if (!fromLocation.trim() || !transport) {
      setDistanceKm(null);
      setDistanceError("");
      return;
    }
    if (selectedPlaces.length === 0) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      calculateDistance(fromLocation, transport, selectedPlaces);
    }, 800);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocation, transport]);

  // ── Manual recalculate (triggered by button, not on each place toggle) ──
  const handleRecalculate = () => {
    calculateDistance(fromLocation, transport, selectedPlaces);
  };

  const needsRecalc = transport && fromLocation.trim() && selectedPlaces.length > 0
    && distanceKm !== null;

  // ── Wishlist toggle ────────────────────────────────────────────
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

  // ── Live cost preview (uses auto-computed distance) ───────────
  const costs = useMemo(() => calcCosts(
    selectedPlaces,
    Number(days) || 1,
    Number(persons) || 1,
    transport,
    distanceKm ?? 0
  ), [selectedPlaces, days, persons, transport, distanceKm]);

  const types = ["All", ...Array.from(new Set(placesData.map((p) => p.type).filter(Boolean)))];
  const filteredPlaces = filterType === "All" ? placesData : placesData.filter((p) => p.type === filterType);

  // ── Build route string for display ────────────────────────────
  const routeString = useMemo(() => {
    if (!fromLocation.trim() || selectedPlaces.length === 0) return null;
    const stops = [fromLocation.trim(), ...selectedPlaces.map((p) => p.name)];
    return stops.join(" → ");
  }, [fromLocation, selectedPlaces]);

  const handleSubmit = async () => {
    if (!days || Number(days) < 1) return showToast("Enter number of days", "error");
    if (!persons || Number(persons) < 1) return showToast("Enter number of persons", "error");
    if (!startDate) return showToast("Select a start date", "error");
    if (selectedPlaces.length === 0) return showToast("Select at least one place", "error");

    setSubmitting(true);
    try {
      // Backend will auto-compute distance — we just pass metadata
      await API.post("/trips", {
        places: selectedPlaces,
        days,
        persons,
        startDate,
        fromLocation: fromLocation || "",
        transport:    transport    || "",
        // distance is intentionally NOT sent — backend recomputes it
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
          <p className="text-slate-500 text-sm">Select places, set travel details, and see live real-world cost breakdown</p>
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
                  <LocationSelector
                    value={fromLocation}
                    onChange={setFromLocation}
                  />
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

              {/* ── Distance Display (auto-computed) ──────────────────── */}
              {transport && (
                <div className="mt-4 animate-fade-in">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                        🛣️ Route Distance
                      </span>
                      {/* Recalculate button — only shown when places are selected */}
                      {selectedPlaces.length > 0 && fromLocation.trim() && !distanceLoading && (
                        <button
                          type="button"
                          onClick={handleRecalculate}
                          className="text-xs text-brand-600 font-semibold px-3 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
                        >
                          🔄 Recalculate
                        </button>
                      )}
                    </div>

                    {/* Loading state */}
                    {distanceLoading && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Spinner size={14} />
                        <span>Calculating route via real road data…</span>
                      </div>
                    )}

                    {/* Error */}
                    {!distanceLoading && distanceError && (
                      <div className="flex items-start gap-2 text-red-600 text-sm">
                        <span>⚠️</span>
                        <span>{distanceError}</span>
                      </div>
                    )}

                    {/* Result */}
                    {!distanceLoading && !distanceError && distanceKm !== null && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-extrabold text-brand-600 tabular-nums">
                            {distanceKm.toLocaleString()} km
                          </span>
                          {distanceFallback && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                              estimated
                            </span>
                          )}
                        </div>

                        {/* Route legs */}
                        {distanceLegs.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            {distanceLegs.map((leg, i) => (
                              <span key={i} className="flex items-center gap-1 text-xs text-slate-500">
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-medium">
                                  {leg.from}
                                </span>
                                <span className="text-slate-300">→</span>
                                {i === distanceLegs.length - 1 && (
                                  <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-medium">
                                    {leg.to}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-xs text-slate-400">
                          Rate: ₹{TRANSPORT_RATES[transport]}/km/person · auto-calculated via OpenStreetMap
                        </p>
                      </div>
                    )}

                    {/* Prompt: fill in from location */}
                    {!distanceLoading && !distanceError && distanceKm === null && (
                      <p className="text-sm text-slate-400">
                        {!fromLocation.trim()
                          ? "Enter your From Location above to calculate distance"
                          : selectedPlaces.length === 0
                          ? "Select at least one place to calculate route"
                          : "Calculating…"}
                      </p>
                    )}
                  </div>
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

              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
                </div>
              )}

              {!loading && filteredPlaces.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">🗺️</p>
                  <p className="text-sm">No places yet — admin needs to add some</p>
                </div>
              )}

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
                  <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-brand-50 text-brand-500">
                    Live
                  </span>
                </h2>

                <div className="space-y-3">

                  {/* Distance row */}
                  {transport && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600 flex items-center gap-1.5">
                        🛣️ Distance
                      </span>
                      {distanceLoading ? (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Spinner size={12} /> Calculating…
                        </span>
                      ) : distanceKm !== null ? (
                        <span className="font-semibold text-slate-700 tabular-nums text-sm">
                          {distanceKm.toLocaleString()} km
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>
                  )}

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
                      {distanceLoading && row.label.startsWith("Transport") ? (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <Spinner size={12} /> …
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700 tabular-nums">₹{row.val.toLocaleString()}</span>
                      )}
                    </div>
                  ))}

                  {/* Total */}
                  <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-white font-bold">💳 Total</span>
                    {distanceLoading ? (
                      <span className="text-white flex items-center gap-2 text-sm">
                        <Spinner size={14} /> Updating…
                      </span>
                    ) : (
                      <span className="text-white font-extrabold text-xl tabular-nums">
                        ₹{costs.totalCost.toLocaleString()}
                      </span>
                    )}
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
                  <p>🛣️ Real road distance via OpenStreetMap</p>
                </div>
              </div>

              {/* Route preview */}
              {routeString && (
                <div className="card p-4 animate-fade-in">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    🗺️ Your Route
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed break-words">{routeString}</p>
                </div>
              )}

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
                disabled={submitting || distanceLoading}
                className="w-full btn-primary py-4 text-base font-bold disabled:opacity-60"
              >
                {submitting
                  ? <span className="flex items-center justify-center gap-2"><Spinner />Booking…</span>
                  : distanceLoading
                  ? <span className="flex items-center justify-center gap-2"><Spinner />Calculating route…</span>
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