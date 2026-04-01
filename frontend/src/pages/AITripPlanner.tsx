import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

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

// ─── Indian States ────────────────────────────────────────────
const INDIAN_STATES = [
  { value: "Karnataka", flag: "🌿" },
  { value: "Kerala", flag: "🌴" },
  { value: "Goa", flag: "🏖️" },
  { value: "Tamil Nadu", flag: "🏛️" },
  { value: "Maharashtra", flag: "🌆" },
  { value: "Rajasthan", flag: "🏰" },
  { value: "Himachal Pradesh", flag: "⛰️" },
  { value: "Uttarakhand", flag: "🗻" },
  { value: "Andhra Pradesh", flag: "🌊" },
  { value: "West Bengal", flag: "🌸" },
  { value: "Gujarat", flag: "🦁" },
  { value: "Madhya Pradesh", flag: "🐯" },
  { value: "Punjab", flag: "🌾" },
  { value: "Bihar", flag: "🕌" },
  { value: "Odisha", flag: "🕍" },
  { value: "Assam", flag: "🦏" },
  { value: "Meghalaya", flag: "🌧️" },
  { value: "Sikkim", flag: "🏔️" },
  { value: "Jammu & Kashmir", flag: "❄️" },
  { value: "Ladakh", flag: "🦅" },
  { value: "Telangana", flag: "🌾" },
  { value: "Jharkhand", flag: "🌳" },
  { value: "Chhattisgarh", flag: "🦋" },
  { value: "Manipur", flag: "🌺" },
  { value: "Nagaland", flag: "🎭" },
];

const INTEREST_OPTIONS = [
  { value: "Beach", label: "🏖️ Beach" },
  { value: "Mountains", label: "⛰️ Mountains" },
  { value: "Heritage", label: "🏛️ Heritage & Culture" },
  { value: "Wildlife", label: "🦁 Wildlife & Nature" },
  { value: "Adventure", label: "🧗 Adventure Sports" },
  { value: "Food", label: "🍜 Food & Cuisine" },
  { value: "Spirituality", label: "🕌 Spirituality" },
  { value: "City", label: "🌆 City Sightseeing" },
  { value: "Photography", label: "📸 Photography" },
  { value: "Backpacking", label: "🎒 Budget Backpacking" },
];

// ─── Place Card ───────────────────────────────────────────────
function PlaceCard({ place }: { place: PlaceSuggestion }) {
  const typeColors: Record<string, string> = {
    Beach: "bg-cyan-100 text-cyan-700",
    Hill: "bg-emerald-100 text-emerald-700",
    City: "bg-violet-100 text-violet-700",
    Forest: "bg-green-100 text-green-700",
    Heritage: "bg-amber-100 text-amber-700",
    Other: "bg-gray-100 text-gray-600",
  };
  const color = typeColors[place.type] || typeColors.Other;
  return (
    <div className="bg-white rounded-2xl p-5 shadow border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-gray-800 text-lg leading-tight">{place.name}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-1 ${color}`}>{place.type}</span>
      </div>
      <p className="text-sm text-indigo-500 font-medium">📍 {place.location}</p>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{place.description}</p>
      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs text-gray-400">Estimated Cost</span>
        <span className="font-bold text-gray-800">₹{place.estimatedCost?.toLocaleString() || "—"}</span>
      </div>
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────
function DayCard({ day }: { day: ItineraryDay }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition text-left">
        <div className="flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">D{day.day}</span>
          <div>
            <p className="font-bold text-gray-800 text-sm">{day.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{(day.places || []).join(" → ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-semibold text-indigo-600">₹{day.estimatedDayCost?.toLocaleString()}</span>
          <span className="text-gray-400">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 grid sm:grid-cols-2 gap-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">🗺️ Activities</p>
            <ul className="space-y-1.5">
              {(day.activities || []).map((a, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">🍽️ Meals</p>
            <ul className="space-y-1.5">
              {(day.meals || []).map((m, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-400 flex-shrink-0">•</span>{m}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AITripPlanner() {
  const navigate = useNavigate();

  // Auth guard — redirect to login if no token
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  // Plan state
  const [budget,          setBudget]          = useState("");
  const [days,            setDays]            = useState("");
  const [selectedState,   setSelectedState]   = useState("");
  const [fromLocation,    setFromLocation]    = useState("");
  const [transport,       setTransport]       = useState("");
  const [distance,        setDistance]        = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [plan,     setPlan]     = useState<TripPlan | null>(null);
  const [error,    setError]    = useState("");
  const [activeTab, setActiveTab] = useState<"itinerary" | "places" | "tips" | "cost">("itinerary");

  // Booking state
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookDate, setBookDate] = useState("");
  const [bookPersons, setBookPersons] = useState("1");
  const [booking, setBooking] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };
  const toggleInterest = (val: string) =>
    setSelectedInterests((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]);

  // ── Generate Plan — uses axios API (proven to attach token) ──
  const handleGenerate = async () => {
    setError("");
    if (!budget || !days)    return setError("Please enter your budget and number of days.");
    if (!selectedState)      return setError("Please select an Indian state to explore.");
    if (Number(budget) < 500) return setError("Minimum budget is ₹500.");
    if (Number(days) < 1 || Number(days) > 30) return setError("Days must be between 1 and 30.");
    if (selectedInterests.length === 0) return setError("Select at least one interest.");
    if (transport && (!distance || Number(distance) < 1))
      return setError("Enter estimated distance from your location for transport cost.");

    setLoading(true);
    setPlan(null);
    try {
      const res = await API.post("/ai-trip", {
        budget:       Number(budget),
        days:         Number(days),
        interests:    selectedInterests,
        state:        selectedState,
        fromLocation: fromLocation || undefined,
        transport:    transport    || undefined,
        distance:     Number(distance) || undefined,
      });
      setPlan(res.data.plan);
      setActiveTab("itinerary");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Book This Trip — uses axios API (proven to attach token) ─
  const handleBookTrip = async () => {
    if (!bookDate) return showToast("Please select a start date", "error");
    if (!bookPersons || Number(bookPersons) < 1) return showToast("Enter at least 1 person", "error");
    if (!plan || !plan.places || plan.places.length === 0) return showToast("No places to book", "error");

    const numDays = Number(days);
    const numPersons = Number(bookPersons);
    if (!numDays || numDays < 1) return showToast("Invalid trip days", "error");

    // Build places array — force-convert through JSON to strip Proxy wrappers
    const rawPlaces: PlaceSuggestion[] = JSON.parse(JSON.stringify(plan.places));
    const maxAllowed = numDays * 3;

    const placesToBook = rawPlaces.slice(0, maxAllowed).map((p) => ({
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
      const safePlaces: object[] = JSON.parse(JSON.stringify(placesToBook));
      await API.post("/trips", {
        places:       safePlaces,
        days:         numDays,
        persons:      numPersons,
        startDate:    bookDate,
        fromLocation: plan.fromLocation || fromLocation || "",
        transport:    plan.transport    || transport    || "",
        distance:     plan.distance     || Number(distance) || 0,
      });
      setShowBookModal(false);
      showToast("Trip booked successfully! 🎉");
      setTimeout(() => navigate("/my-trips"), 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.msg || err?.message || "Error booking trip.";
      showToast(msg, "error");
    } finally {
      setBooking(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
  const stateFlag = INDIAN_STATES.find((s) => s.value === selectedState)?.flag || "🗺️";

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/60 min-h-screen" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
        </div>
      )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-800">🗓️ Confirm Booking</h3>
                <p className="text-sm text-gray-500 mt-1">{plan?.title}</p>
              </div>
              <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Places chips */}
            <div className="bg-indigo-50 rounded-xl p-3 mb-4">
              <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">📍 Places to Book</p>
              <div className="flex flex-wrap gap-1.5">
                {(plan?.places || []).slice(0, 6).map((p, i) => (
                  <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.name}</span>
                ))}
                {(plan?.places || []).length > 6 && (
                  <span className="text-xs text-indigo-400">+{(plan?.places || []).length - 6} more</span>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={bookDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Persons */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Number of Persons</label>
              <input
                type="number"
                value={bookPersons}
                min={1}
                max={20}
                onChange={(e) => setBookPersons(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Days</p>
                <p className="font-bold text-gray-800">{days}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Places</p>
                <p className="font-bold text-gray-800">{Math.min((plan?.places || []).length, Number(days) * 3)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Est. Cost</p>
                <p className="font-bold text-gray-800">₹{plan?.totalEstimatedCost?.toLocaleString()}</p>
              </div>
            </div>

            <button
              id="confirm-book-btn"
              onClick={handleBookTrip}
              disabled={booking}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {booking ? <><span className="animate-spin">⟳</span> Booking...</> : <>✅ Confirm & Book Trip</>}
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-black/60 backdrop-blur-sm">
        <button onClick={() => navigate("/dashboard")} className="text-white text-sm hover:underline">← Dashboard</button>
        <span className="text-white font-semibold tracking-wide">🤖 AI Trip Planner</span>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate("/my-wishlist")} className="text-white text-sm hover:underline">❤️ Wishlist</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded transition">Logout</button>
        </div>
      </div>

      <div className="relative z-10 pt-20 pb-12 px-4 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
            Plan Your Dream Trip<br /><span className="text-indigo-300">with AI ✨</span>
          </h1>
          <p className="text-white/70 text-base">Choose a state, set your budget & interests — get a personalised itinerary instantly.</p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-5">🎯 Customize Your Trip</h2>

          {/* State */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              📍 Select Indian State <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">{stateFlag}</span>
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={inputCls + " pl-10 appearance-none cursor-pointer"}>
                <option value="">— Choose a state to explore —</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.flag} {s.value}</option>
                ))}
              </select>
            </div>
          </div>

          {/* From Location + Transport row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                📌 From Location <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </label>
              <input type="text" placeholder="e.g. Bangalore, Mumbai..."
                value={fromLocation} onChange={e => setFromLocation(e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Transport Mode</label>
              <select value={transport} onChange={e => setTransport(e.target.value)} className={inputCls}>
                <option value="">🚶 No vehicle / Self-arranged</option>
                <option value="Bus">🚌 Bus — ₹5/km</option>
                <option value="Train">🚂 Train — ₹7/km</option>
                <option value="Car">🚗 Car / Cab — ₹10/km</option>
              </select>
            </div>
          </div>

          {/* Distance — shown only when transport selected */}
          {transport && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Estimated Distance (km, one-way) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="e.g. 250"
                  value={distance} onChange={e => setDistance(e.target.value)}
                  className={inputCls} />
                <span className="text-sm text-gray-400 whitespace-nowrap">km × 2</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Rate includes return journey</p>
            </div>
          )}

          {/* Budget & Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                <input type="number" placeholder="e.g. 15000" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls + " pl-8"} min={500} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Number of Days</label>
              <input type="number" placeholder="e.g. 5" value={days} onChange={(e) => setDays(e.target.value)} className={inputCls} min={1} max={30} />
            </div>
          </div>

          {/* Interests */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Interests (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleInterest(opt.value)}
                  className={`text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                    selectedInterests.includes(opt.value)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                      : "bg-white border-gray-200 text-gray-600 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">❌ {error}</div>}

          <button
            id="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
          >
            {loading ? <><span className="animate-spin text-xl">⟳</span> Crafting your {selectedState || "India"} itinerary...</> : <>✨ Generate {selectedState ? `${selectedState} ` : ""}Trip Plan</>}
          </button>
        </div>

        {/* Shimmer */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white/20 rounded-2xl h-24 animate-pulse" />)}
            <p className="text-white/70 text-center text-sm animate-pulse">🤖 AI is crafting your {selectedState} itinerary...</p>
          </div>
        )}

        {/* Results */}
        {plan && !loading && (
          <div className="space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
              {plan.state && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">📍 {plan.state}</span>
                </div>
              )}
              <h2 className="text-2xl font-extrabold mb-1 leading-tight">{plan.title}</h2>
              <p className="text-white/80 text-sm mb-4">{plan.summary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "State", value: plan.state || "India" },
                  { label: "Est. Cost", value: `₹${plan.totalEstimatedCost?.toLocaleString()}` },
                  { label: "Duration", value: `${days} Day${Number(days) > 1 ? "s" : ""}` },
                  { label: "Places", value: String(plan.places?.length || 0) },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                    <p className="font-bold text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/20 rounded-xl p-1 backdrop-blur">
              {(["itinerary", "places", "cost", "tips"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                    activeTab === tab ? "bg-white text-indigo-700 shadow" : "text-white hover:bg-white/20"
                  }`}
                >
                  {tab === "itinerary" && "📅 "}
                  {tab === "places"    && "🗺️ "}
                  {tab === "cost"      && "💰 "}
                  {tab === "tips"      && "💡 "}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "itinerary" && (
              <div className="space-y-3">
                {/* Route strip */}
                {plan.routeOrder && plan.routeOrder.length > 0 && (
                  <div className="bg-white/95 rounded-2xl p-4 shadow">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">🛣️ Travel Route</p>
                    <div className="flex flex-wrap items-center gap-1">
                      {plan.routeOrder.map((stop, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                            i === 0 || i === plan.routeOrder!.length - 1
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          }`}>{stop}</span>
                          {i < plan.routeOrder!.length - 1 && (
                            <span className="text-gray-400 text-xs">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(plan.itinerary || []).map((day) => <DayCard key={day.day} day={day} />)}
              </div>
            )}

            {activeTab === "cost" && (
              <div className="bg-white/95 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">💰 Cost Breakdown</h3>

                {/* Cost table */}
                <div className="space-y-2">
                  {[
                    { icon: "🎟", label: "Places (entry fees)",       value: plan.placeCost     },
                    { icon: plan.transport === "Car" ? "🚗" : plan.transport === "Bus" ? "🚌" : "🚂",
                      label: `Transport (${plan.transport || "self-arranged"})${
                        plan.distance ? ` · ${plan.distance} km × 2` : ""
                      }`, value: plan.transportCost },
                    { icon: "🍽", label: `Food (${days} days × 3 meals × ₹150)`, value: plan.foodCost },
                  ].map((row) => row.value != null && (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{row.icon} {row.label}</span>
                      <span className="font-semibold text-gray-800">₹{(row.value).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-gray-800">💳 TOTAL (per person)</span>
                    <span className="font-extrabold text-indigo-700 text-lg">₹{plan.totalEstimatedCost?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Formula note */}
                <div className="bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700 space-y-1">
                  <p className="font-semibold mb-1">Formula used:</p>
                  <p>🚗 Car → ₹10/km &nbsp; 🚌 Bus → ₹5/km &nbsp; 🚂 Train → ₹7/km</p>
                  <p>🍽 Food → ₹150/meal × 3 meals/day × days</p>
                  <p>🔄 Distance includes return journey (×2)</p>
                </div>

                {fromLocation && plan.routeOrder && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Route:</p>
                    <p className="text-sm text-gray-700">{plan.routeOrder.join(" → ")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "places" && (
              <div>
                <p className="text-white/70 text-sm mb-4 text-center">
                  {plan.places?.length || 0} places curated within <strong className="text-white">{plan.state || selectedState}</strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(plan.places || []).map((place, i) => <PlaceCard key={i} place={place} />)}
                </div>
              </div>
            )}

            {activeTab === "tips" && (
              <div className="bg-white/95 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Tips for {plan.state || selectedState}</h3>
                <ul className="space-y-3">
                  {(plan.tips || []).map((tip, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
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

            {/* Book Button */}
            <button
              id="book-trip-btn"
              onClick={() => setShowBookModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-base"
            >
              🗓️ Book This Trip
            </button>

            {/* Regenerate */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold py-3 rounded-xl transition border border-white/30"
            >
              🔄 Generate a New {selectedState} Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
