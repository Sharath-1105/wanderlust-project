import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { fetchRouteDistance, type DistanceLeg } from "../services/distanceApi";
import Navbar from "../components/Navbar";
import LocationSelector from "../components/LocationSelector";

// ─── Types ────────────────────────────────────────────────────
interface PlaceSuggestion {
  name: string;
  type: string;
  location: string;
  description: string;
  estimatedCost: number;
}

interface ItineraryDay {
  day: number;
  title: string;
  places: string[];
  activities: string[];
  meals: string[];
  estimatedDayCost: number;
}

interface TripPlan {
  title: string;
  summary: string;
  state?: string;
  fromLocation?: string;
  transport?: string;
  distance?: number;
  routeOrder?: string[];
  placeCost?: number;
  transportCost?: number;
  foodCost?: number;
  totalEstimatedCost: number;
  places: PlaceSuggestion[];
  itinerary: ItineraryDay[];
  tips: string[];
  bestTimeToVisit: string;
}

// ─── Indian States ─────────────────────────────────────────────
const INDIAN_STATES = [
  { value: "Karnataka",         flag: "🌿" },
  { value: "Kerala",            flag: "🌴" },
  { value: "Goa",               flag: "🏖️" },
  { value: "Tamil Nadu",        flag: "🏛️" },
  { value: "Maharashtra",       flag: "🌆" },
  { value: "Rajasthan",         flag: "🏰" },
  { value: "Himachal Pradesh",  flag: "⛰️" },
  { value: "Uttarakhand",       flag: "🗻" },
  { value: "Andhra Pradesh",    flag: "🌊" },
  { value: "West Bengal",       flag: "🌸" },
  { value: "Gujarat",           flag: "🦁" },
  { value: "Madhya Pradesh",    flag: "🐯" },
  { value: "Punjab",            flag: "🌾" },
  { value: "Bihar",             flag: "🕌" },
  { value: "Odisha",            flag: "🕍" },
  { value: "Assam",             flag: "🦏" },
  { value: "Meghalaya",         flag: "🌧️" },
  { value: "Sikkim",            flag: "🏔️" },
  { value: "Jammu & Kashmir",   flag: "❄️" },
  { value: "Ladakh",            flag: "🦅" },
  { value: "Telangana",         flag: "🌾" },
  { value: "Jharkhand",         flag: "🌳" },
  { value: "Chhattisgarh",      flag: "🦋" },
  { value: "Manipur",           flag: "🌺" },
  { value: "Nagaland",          flag: "🎭" },
];

const INTEREST_OPTIONS = [
  { value: "Beach",         label: "🏖️ Beach"        },
  { value: "Mountains",     label: "⛰️ Mountains"    },
  { value: "Heritage",      label: "🏛️ Heritage"     },
  { value: "Wildlife",      label: "🦁 Wildlife"     },
  { value: "Adventure",     label: "🧗 Adventure"    },
  { value: "Food",          label: "🍜 Food"         },
  { value: "Spirituality",  label: "🕌 Spirituality" },
  { value: "City",          label: "🌆 City"         },
  { value: "Photography",   label: "📸 Photography"  },
  { value: "Backpacking",   label: "🎒 Backpacking"  },
];

const TRANSPORT_RATES: Record<string, number> = { Car: 10, Bus: 5, Train: 7 };

// ─── Inline Spinner ────────────────────────────────────────────
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size }} className="animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

// ─── Timeline Day Card ────────────────────────────────────────
function TimelineDayCard({ day, isLast }: { day: ItineraryDay; isLast: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
          D{day.day}
        </div>
        {!isLast && <div className="w-0.5 bg-gradient-to-b from-brand-300 to-transparent flex-1 mt-1 min-h-[24px]" />}
      </div>
      <div className="flex-1 mb-5">
        <div className="card overflow-hidden">
          <button onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800">{day.title}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{(day.places || []).join(" → ")}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <span className="text-sm font-semibold text-brand-600">
                ₹{day.estimatedDayCost?.toLocaleString()}
              </span>
              <span className="text-slate-400 text-xs">{open ? "▲" : "▼"}</span>
            </div>
          </button>
          {open && (
            <div className="px-5 pb-5 pt-1 grid sm:grid-cols-2 gap-4 border-t border-slate-100 animate-fade-in">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-3">🗺️ Activities</p>
                <ul className="space-y-1.5">
                  {(day.activities || []).map((a, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-brand-400 flex-shrink-0 mt-0.5">•</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-3">🍽️ Meals</p>
                <ul className="space-y-1.5">
                  {(day.meals || []).map((m, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>{m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Place Card ────────────────────────────────────────────────
function PlaceCard({ place }: { place: PlaceSuggestion }) {
  const typeColors: Record<string, { bg: string; text: string }> = {
    Beach:   { bg: "bg-cyan-50",    text: "text-cyan-700"    },
    Hill:    { bg: "bg-emerald-50", text: "text-emerald-700" },
    City:    { bg: "bg-violet-50",  text: "text-violet-700"  },
    Forest:  { bg: "bg-green-50",   text: "text-green-700"   },
    Heritage:{ bg: "bg-amber-50",   text: "text-amber-700"   },
    Other:   { bg: "bg-slate-50",   text: "text-slate-600"   },
  };
  const c = typeColors[place.type] || typeColors.Other;
  return (
    <div className="card p-5 flex flex-col gap-2 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-slate-800 text-base leading-tight">{place.name}</h4>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5 ${c.bg} ${c.text}`}>
          {place.type}
        </span>
      </div>
      <p className="text-xs text-brand-500 font-medium">📍 {place.location}</p>
      <p className="text-sm text-slate-600 leading-relaxed flex-1">{place.description}</p>
      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400">Estimated Cost</span>
        <span className="font-bold text-slate-800">₹{place.estimatedCost?.toLocaleString() || "—"}</span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function AITripPlanner() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  // ── Form inputs ────────────────────────────────────────────────
  const [budget, setBudget]               = useState("");
  const [days, setDays]                   = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [fromLocation, setFromLocation]   = useState("");
  const [transport, setTransport]         = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // ── Plan state ─────────────────────────────────────────────────
  const [loading, setLoading]             = useState(false);
  const [plan, setPlan]                   = useState<TripPlan | null>(null);
  const [error, setError]                 = useState("");
  const [activeTab, setActiveTab]         = useState<"itinerary" | "places" | "tips" | "cost">("itinerary");

  // ── Booking modal ──────────────────────────────────────────────
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookDate, setBookDate]           = useState("");
  const [bookPersons, setBookPersons]     = useState("1");
  const [booking, setBooking]             = useState(false);

  // ── Real-distance state (computed at booking time only) ────────
  const [bookingDistanceKm, setBookingDistanceKm]     = useState<number | null>(null);
  const [bookingLegs, setBookingLegs]                 = useState<DistanceLeg[]>([]);
  const [computingDistance, setComputingDistance]     = useState(false);
  const [distanceComputedFor, setDistanceComputedFor] = useState<string>(""); // key to avoid re-compute

  // ── Toast ──────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const toggleInterest = (val: string) =>
    setSelectedInterests((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]);

  // ── Generate plan (uses estimated/AI-provided distance) ─────────
  // ⚠️ NO real distance calculation here — AI returns estimated cost only.
  const handleGenerate = async () => {
    setError("");
    if (!budget || !days) return setError("Please enter your budget and number of days.");
    if (!selectedState) return setError("Please select a state to explore.");
    if (Number(budget) < 500) return setError("Minimum budget is ₹500.");
    if (Number(days) < 1 || Number(days) > 30) return setError("Days must be between 1 and 30.");
    if (selectedInterests.length === 0) return setError("Select at least one interest.");

    setLoading(true);
    setPlan(null);
    setBookingDistanceKm(null);
    setDistanceComputedFor("");

    try {
      const res = await API.post("/ai-trip", {
        budget:       Number(budget),
        days:         Number(days),
        interests:    selectedInterests,
        state:        selectedState,
        fromLocation: fromLocation || undefined,
        transport:    transport    || undefined,
        // ⚠️ distance NOT sent — backend uses estimate for AI planning
      });
      setPlan(res.data.plan);
      setActiveTab("itinerary");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Open booking modal and compute real distance ────────────────
  const openBookModal = async () => {
    setShowBookModal(true);

    if (!fromLocation.trim() || !transport || !plan?.places?.length) {
      // Can't compute — skip; backend will handle with fallback
      return;
    }

    // Build a stable cache key so we don't re-compute if nothing changed
    const placeNames   = plan.places.map((p) => p.name);
    const cacheKey     = `${fromLocation}|${transport}|${placeNames.join(",")}`;
    if (distanceComputedFor === cacheKey && bookingDistanceKm !== null) return; // already computed

    setComputingDistance(true);
    try {
      const result = await fetchRouteDistance(fromLocation.trim(), placeNames);
      setBookingDistanceKm(result.totalDistanceKm);
      setBookingLegs(result.legs || []);
      setDistanceComputedFor(cacheKey);
    } catch (err: any) {
      console.warn("Distance pre-fetch failed:", err?.message);
      // Non-fatal — backend will fallback at booking
    } finally {
      setComputingDistance(false);
    }
  };

  // ── Handle actual booking ──────────────────────────────────────
  const handleBookTrip = async () => {
    if (!bookDate) return showToast("Please select a start date", "error");
    if (!bookPersons || Number(bookPersons) < 1) return showToast("Enter at least 1 person", "error");
    if (!plan || !plan.places || plan.places.length === 0) return showToast("No places to book", "error");

    const numDays    = Number(days);
    const numPersons = Number(bookPersons);
    if (!numDays || numDays < 1) return showToast("Invalid trip days", "error");

    const rawPlaces: PlaceSuggestion[] = JSON.parse(JSON.stringify(plan.places));
    const placesToBook = rawPlaces.slice(0, numDays * 3).map((p) => ({
      name:          (p.name || "Unknown Place").toString().substring(0, 100),
      state:         (plan.state || selectedState || "").toString(),
      district:      (p.location || "").toString().substring(0, 100),
      location:      (p.location || "").toString().substring(0, 100),
      type:          (p.type || "Other").toString(),
      image:         "",
      description:   (p.description || "").toString().substring(0, 500),
      entryFee:      isNaN(Number(p.estimatedCost)) ? 0 : Number(p.estimatedCost),
      transportCost: 0,
      price:         isNaN(Number(p.estimatedCost)) ? 0 : Number(p.estimatedCost),
      rating:        0,
    }));

    if (placesToBook.length === 0) return showToast("No valid places to book", "error");

    setBooking(true);
    try {
      // Backend ALWAYS recomputes distance + cost — we pass metadata only
      await API.post("/trips", {
        places:       JSON.parse(JSON.stringify(placesToBook)),
        days:         numDays,
        persons:      numPersons,
        startDate:    bookDate,
        fromLocation: fromLocation || plan.fromLocation || "",
        transport:    transport    || plan.transport    || "",
        // ⚠️ distance intentionally omitted — backend is source of truth
      });
      setShowBookModal(false);
      showToast("Trip booked successfully! 🎉");
      setTimeout(() => navigate("/my-trips"), 1800);
    } catch (err: any) {
      showToast(err?.response?.data?.msg || err?.message || "Error booking trip.", "error");
    } finally {
      setBooking(false);
    }
  };

  const stateFlag = INDIAN_STATES.find((s) => s.value === selectedState)?.flag || "🗺️";

  const TABS: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: "itinerary", label: "Itinerary", icon: "📅" },
    { id: "places",    label: "Places",    icon: "🗺️" },
    { id: "cost",      label: "Cost",      icon: "💰" },
    { id: "tips",      label: "Tips",      icon: "💡" },
  ];

  // ── Estimated transport cost helper (for cost tab display) ───
  const estimatedTransportCost = plan?.transportCost
    ?? (plan?.distance && transport ? (TRANSPORT_RATES[transport] || 0) * plan.distance : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="AI Trip Planner" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fade-in ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      {/* ── Booking Modal ──────────────────────────────────────────── */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10 animate-slide-up">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800">🗓️ Confirm Booking</h3>
                <p className="text-sm text-slate-500 mt-1">{plan?.title}</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>

            {/* ── Real distance preview ──────────────────────────────── */}
            {fromLocation && transport && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  🛣️ Real Route Distance
                </p>
                {computingDistance ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Spinner size={13} />
                    <span>Calculating real-world route…</span>
                  </div>
                ) : bookingDistanceKm !== null ? (
                  <div>
                    <p className="text-lg font-extrabold text-brand-600">{bookingDistanceKm.toLocaleString()} km</p>
                    {bookingLegs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {bookingLegs.map((leg, i) => (
                          <span key={i} className="flex items-center gap-0.5 text-xs text-slate-500">
                            <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-medium">{leg.from}</span>
                            <span className="text-slate-300">→</span>
                            {i === bookingLegs.length - 1 && (
                              <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-medium">{leg.to}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Via OpenStreetMap · Cost computed server-side at booking</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Cost will be calculated server-side at booking</p>
                )}
              </div>
            )}

            <div className="bg-brand-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-brand-600 mb-2 uppercase tracking-wide">📍 Places</p>
              <div className="flex flex-wrap gap-1.5">
                {(plan?.places || []).slice(0, 6).map((p, i) => (
                  <span key={i} className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.name}</span>
                ))}
                {(plan?.places || []).length > 6 && (
                  <span className="text-xs text-brand-400">+{(plan?.places || []).length - 6} more</span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="label-text">Start Date *</label>
              <input type="date" value={bookDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookDate(e.target.value)}
                className="input-field" />
            </div>
            <div className="mb-5">
              <label className="label-text">Number of Persons</label>
              <input type="number" value={bookPersons} min={1} max={20}
                onChange={(e) => setBookPersons(e.target.value)} className="input-field" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Days",    value: days },
                { label: "Places",  value: Math.min((plan?.places || []).length, Number(days) * 3) },
                { label: "Est. Cost", value: `₹${plan?.totalEstimatedCost?.toLocaleString()}` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400">{s.label}</p>
                  <p className="font-bold text-slate-800 text-sm">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4 text-xs text-amber-700 flex items-start gap-2">
              <span>ℹ️</span>
              <span>Final cost is calculated server-side using real road distance at booking time.</span>
            </div>

            <button
              id="confirm-book-btn"
              onClick={handleBookTrip}
              disabled={booking || computingDistance}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {booking
                ? <><Spinner />Booking…</>
                : computingDistance
                ? <><Spinner />Computing route…</>
                : <>✅ Confirm & Book Trip</>
              }
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            🤖 Powered by AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 mb-3 leading-tight">
            Plan Your Dream Trip<br />
            <span className="bg-gradient-to-r from-brand-500 to-violet-600 bg-clip-text text-transparent">with AI ✨</span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Choose a state, set your budget & interests — get a personalised itinerary in seconds.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${plan && !loading ? "xl:grid-cols-2" : ""} gap-8`}>
          {/* ── LEFT: Input Form ─────────────────────────── */}
          <div className="space-y-0">
            <div className="card p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">🎯</span>
                Customize Your Trip
              </h2>

              {/* State */}
              <div className="mb-5">
                <label className="label-text">📍 Select Indian State *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">{stateFlag}</span>
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                    className="input-field pl-10 appearance-none cursor-pointer">
                    <option value="">— Choose a state —</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s.value} value={s.value}>{s.flag} {s.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* From + Transport */}
              <div className="mb-5">
                <LocationSelector
                  value={fromLocation}
                  onChange={setFromLocation}
                  defaultState={selectedState}
                />
              </div>
              <div className="mb-5">
                <label className="label-text">Transport Mode</label>
                <select value={transport} onChange={(e) => setTransport(e.target.value)} className="input-field">
                  <option value="">🚶 No vehicle</option>
                  <option value="Bus">🚌 Bus — ₹5/km</option>
                  <option value="Train">🚂 Train — ₹7/km</option>
                  <option value="Car">🚗 Car — ₹10/km</option>
                </select>
              </div>

              {/* Info: distance calculated at booking */}
              {transport && fromLocation && (
                <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2 animate-fade-in">
                  <span>ℹ️</span>
                  <div className="text-xs text-blue-700">
                    <b>Real-world distance</b> is computed automatically when you click <b>Book Trip</b>.
                    The AI plan shows an estimated cost based on your inputs.
                  </div>
                </div>
              )}

              {/* Budget & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="label-text">Total Budget (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
                    <input type="number" placeholder="e.g. 15000" value={budget}
                      onChange={(e) => setBudget(e.target.value)} className="input-field pl-8" min={500} />
                  </div>
                </div>
                <div>
                  <label className="label-text">Number of Days</label>
                  <input type="number" placeholder="e.g. 5" value={days}
                    onChange={(e) => setDays(e.target.value)} className="input-field" min={1} max={30} />
                </div>
              </div>

              {/* Interests */}
              <div className="mb-5">
                <label className="label-text mb-3 block">Interests *</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => toggleInterest(opt.value)}
                      className={`text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                        selectedInterests.includes(opt.value)
                          ? "bg-brand-500 border-brand-500 text-white shadow-sm scale-105"
                          : "bg-white border-slate-200 text-slate-600 hover:border-brand-400"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
                  <span>❌</span>{error}
                </div>
              )}

              <button
                id="generate-btn"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full btn-primary py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Crafting your {selectedState || "India"} itinerary…
                  </span>
                ) : `✨ Generate ${selectedState ? `${selectedState} ` : ""}Trip Plan`}
              </button>
            </div>

            {/* Skeleton loading */}
            {loading && (
              <div className="mt-6 space-y-3 animate-fade-in">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded-lg" />
                      <div className="skeleton h-16 rounded-xl" />
                    </div>
                  </div>
                ))}
                <p className="text-slate-400 text-center text-sm animate-pulse mt-4">
                  🤖 AI is crafting your {selectedState} itinerary…
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Results ───────────────────────────── */}
          {plan && !loading && (
            <div className="space-y-5 animate-slide-up">
              {/* Banner */}
              <div className="rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-6 text-white shadow-xl">
                {plan.state && (
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    📍 {plan.state}
                  </span>
                )}
                <h2 className="text-2xl font-extrabold mb-1 leading-tight">{plan.title}</h2>
                <p className="text-white/75 text-sm mb-4">{plan.summary}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "State",     value: plan.state || "India" },
                    { label: "Est. Cost", value: `₹${plan.totalEstimatedCost?.toLocaleString()}` },
                    { label: "Duration",  value: `${days} Day${Number(days) > 1 ? "s" : ""}` },
                    { label: "Places",    value: String(plan.places?.length || 0) },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center">
                      <p className="text-xs text-white/60 mb-0.5">{stat.label}</p>
                      <p className="font-bold text-sm">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-white rounded-2xl p-1 shadow-card border border-slate-100">
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-brand-500 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Itinerary tab */}
              {activeTab === "itinerary" && (
                <div className="animate-fade-in">
                  {plan.routeOrder && plan.routeOrder.length > 0 && (
                    <div className="card p-4 mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">🛣️ Suggested Route</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {plan.routeOrder.map((stop, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                              i === 0 || i === plan.routeOrder!.length - 1
                                ? "bg-brand-600 text-white"
                                : "bg-brand-50 text-brand-700 border border-brand-200"
                            }`}>{stop}</span>
                            {i < plan.routeOrder!.length - 1 && (
                              <span className="text-slate-400 text-xs">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    {(plan.itinerary || []).map((day, i) => (
                      <TimelineDayCard
                        key={day.day}
                        day={day}
                        isLast={i === (plan.itinerary || []).length - 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Cost tab — shows AI estimated cost with clear "estimated" label */}
              {activeTab === "cost" && (
                <div className="card p-6 space-y-4 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">💰</span>
                    Cost Breakdown
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                      Estimated
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        icon:  "🎟",
                        label: "Places (entry fees)",
                        value: plan.placeCost,
                      },
                      {
                        icon:  plan.transport === "Car" ? "🚗" : plan.transport === "Bus" ? "🚌" : "🚂",
                        label: `Transport (${plan.transport || "self-arranged"}) · estimated`,
                        value: estimatedTransportCost,
                      },
                      {
                        icon:  "🍽",
                        label: `Food (${days} days × 3 meals × ₹150)`,
                        value: plan.foodCost,
                      },
                    ].map((row) => row.value != null && (
                      <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="text-sm text-slate-600">{row.icon} {row.label}</span>
                        <span className="font-semibold text-slate-800 tabular-nums">₹{(row.value).toLocaleString()}</span>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-between items-center bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl px-4 py-3">
                      <span className="font-extrabold text-white">💳 Total (per person, est.)</span>
                      <span className="font-extrabold text-white text-xl tabular-nums">
                        ₹{plan.totalEstimatedCost?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 space-y-1">
                    <p className="font-semibold mb-1">⚠️ Estimated Cost Note:</p>
                    <p>This is AI-generated estimate. Final cost is calculated with real road distance when you book.</p>
                    <p className="mt-1 pt-1 border-t border-amber-200">
                      🚗 Car ₹10/km · 🚌 Bus ₹5/km · 🚂 Train ₹7/km · 🍽 ₹150/meal
                    </p>
                  </div>
                </div>
              )}

              {/* Places tab */}
              {activeTab === "places" && (
                <div className="animate-fade-in">
                  <p className="text-slate-500 text-sm mb-4">
                    {plan.places?.length || 0} places curated in <strong className="text-slate-700">{plan.state || selectedState}</strong>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(plan.places || []).map((place, i) => (
                      <PlaceCard key={i} place={place} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tips tab */}
              {activeTab === "tips" && (
                <div className="card p-6 animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">💡 Tips for {plan.state || selectedState}</h3>
                  <ul className="space-y-3">
                    {(plan.tips || []).map((tip, i) => (
                      <li key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-slate-700 text-sm leading-relaxed">{tip}</p>
                      </li>
                    ))}
                  </ul>
                  {plan.bestTimeToVisit && (
                    <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                      <span className="text-2xl">🗓️</span>
                      <div>
                        <p className="font-semibold text-amber-800 text-sm">Best Time to Visit {plan.state}</p>
                        <p className="text-amber-700 text-sm">{plan.bestTimeToVisit}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Book Trip CTA */}
              <button
                id="book-trip-btn"
                onClick={openBookModal}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 text-base"
              >
                🗓️ Book This Trip — Real Cost Calculated at Booking
              </button>

              <button onClick={handleGenerate} disabled={loading} className="w-full btn-secondary py-3 text-sm">
                🔄 Generate a New Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
