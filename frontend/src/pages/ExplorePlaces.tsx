import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

const PLACE_TYPES = ["All", "Beach", "Hill", "City", "Forest", "Heritage", "Other"];
const RATINGS = ["Any", "1", "2", "3", "4", "5"];

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Beach:   { color: "text-cyan-700",   bg: "bg-cyan-50",   icon: "🏖️" },
  Hill:    { color: "text-emerald-700",bg: "bg-emerald-50",icon: "⛰️" },
  City:    { color: "text-violet-700", bg: "bg-violet-50", icon: "🌆" },
  Forest:  { color: "text-green-700",  bg: "bg-green-50",  icon: "🌿" },
  Heritage:{ color: "text-amber-700",  bg: "bg-amber-50",  icon: "🏛️" },
  Other:   { color: "text-slate-600",  bg: "bg-slate-50",  icon: "📍" },
};

interface Place {
  _id: string;
  name: string;
  state: string;
  district: string;
  location: string;
  type: string;
  price: number;
  rating: number;
  entryFee: number;
  transportCost: number;
  image?: string;
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  rating: string;
  location: string;
  type: string;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">
        {rating > 0 ? rating.toFixed(1) : "—"}
      </span>
    </div>
  );
}

/* Skeleton card */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="skeleton h-44 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-8 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function ExplorePlaces() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ minPrice: "", maxPrice: "", rating: "", location: "", type: "" });
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchWishlist();
    applyFilters(filters);
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlistIds(res.data.map((p: any) => p._id));
    } catch {}
  };

  const applyFilters = useCallback(async (f: Filters) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (f.minPrice) params.append("minPrice", f.minPrice);
      if (f.maxPrice) params.append("maxPrice", f.maxPrice);
      if (f.rating && f.rating !== "Any") params.append("rating", f.rating);
      if (f.location.trim()) params.append("location", f.location.trim());
      if (f.type && f.type !== "All") params.append("type", f.type);
      const res = await API.get(`/places/filter?${params.toString()}`);
      setPlaces(res.data);
    } catch {
      showToast("Error fetching places", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (field: keyof Filters, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleReset = () => {
    const empty: Filters = { minPrice: "", maxPrice: "", rating: "", location: "", type: "" };
    setFilters(empty);
    applyFilters(empty);
  };

  const toggleWishlist = async (e: React.MouseEvent, place: Place) => {
    e.stopPropagation();
    const isSaved = wishlistIds.includes(place._id);
    try {
      if (isSaved) {
        await API.delete(`/wishlist/remove/${place._id}`);
        setWishlistIds((p) => p.filter((id) => id !== place._id));
        showToast("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add/${place._id}`);
        setWishlistIds((p) => [...p, place._id]);
        showToast("Saved to wishlist ❤️");
      }
    } catch {
      showToast("Error updating wishlist", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="Explore Places" />

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
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1">Explore Places</h1>
          <p className="text-slate-500">Discover India's finest beaches, hills, cities and heritage</p>
        </div>

        {/* Filter Panel */}
        <div className="card p-6 mb-8 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">

            {/* Type pills */}
            <div className="xl:col-span-6">
              <label className="label-text">Place Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PLACE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange("type", t === "All" ? "" : t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      (t === "All" && !filters.type) || filters.type === t
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    {TYPE_CONFIG[t]?.icon || "🌐"} {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-text">Min Price (₹)</label>
              <input type="number" placeholder="500" value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                className="input-field" min={0} />
            </div>
            <div>
              <label className="label-text">Max Price (₹)</label>
              <input type="number" placeholder="5000" value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                className="input-field" min={0} />
            </div>
            <div>
              <label className="label-text">Min Rating</label>
              <select value={filters.rating} onChange={(e) => handleChange("rating", e.target.value)} className="input-field">
                {RATINGS.map((r) => (
                  <option key={r} value={r === "Any" ? "" : r}>
                    {r === "Any" ? "Any Rating" : `${r}★ & above`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Location</label>
              <input type="text" placeholder="e.g. Goa, Kerala..." value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
                className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => applyFilters(filters)} className="flex-1 btn-primary py-2.5 text-sm">
                🔍 Search
              </button>
              <button onClick={handleReset} className="flex-1 btn-secondary py-2.5 text-sm">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && searched && (
          <p className="text-slate-500 text-sm mb-5 animate-fade-in">
            {places.length === 0 ? "No places match your filters." : `${places.length} place${places.length > 1 ? "s" : ""} found`}
          </p>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && places.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-6xl mb-4">🔭</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No places found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or explore all destinations</p>
            <button onClick={handleReset} className="btn-primary px-8">
              Show All Places
            </button>
          </div>
        )}

        {/* Cards grid */}
        {!loading && places.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place, i) => {
              const cfg = TYPE_CONFIG[place.type] || TYPE_CONFIG.Other;
              const isSaved = wishlistIds.includes(place._id);
              return (
                <div
                  key={place._id}
                  className="card overflow-hidden group animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {/* Image / placeholder */}
                  <div className="relative h-44 overflow-hidden">
                    {place.image ? (
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br ${
                        place.type === "Beach" ? "from-cyan-100 to-blue-100" :
                        place.type === "Hill" ? "from-emerald-100 to-green-100" :
                        place.type === "City" ? "from-violet-100 to-purple-100" :
                        place.type === "Heritage" ? "from-amber-100 to-yellow-100" :
                        "from-slate-100 to-slate-50"
                      }`}>
                        {cfg.icon}
                      </div>
                    )}
                    {/* Type badge */}
                    <span className={`absolute top-3 left-3 ${cfg.bg} ${cfg.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                      {cfg.icon} {place.type}
                    </span>
                    {/* Wishlist */}
                    <button
                      onClick={(e) => toggleWishlist(e, place)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                    >
                      {isSaved ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-slate-500 text-xs mb-2">
                      📍 {[place.location, place.district, place.state].filter(Boolean).join(", ") || "India"}
                    </p>
                    <StarDisplay rating={place.rating} />

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-slate-400 block">Price</span>
                        <span className="font-bold text-slate-700">₹{place.price || "—"}</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-slate-400 block">Entry Fee</span>
                        <span className="font-bold text-slate-700">₹{place.entryFee || "—"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/book-trip")}
                      className="mt-4 w-full btn-primary py-2.5 text-sm"
                    >
                      Book This Place
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
