import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

const PLACE_TYPES = ["All", "Beach", "Hill", "City", "Forest", "Heritage", "Other"];
const RATINGS = ["Any", "1", "2", "3", "4", "5"];

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
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating > 0 ? rating.toFixed(1) : "—"}</span>
    </div>
  );
}

export default function ExplorePlaces() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    rating: "",
    location: "",
    type: "",
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load wishlist ids & initial unfiltered results on mount
  useEffect(() => {
    fetchWishlist();
    applyFilters(filters); // show all on load
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlistIds(res.data.map((p: any) => p._id));
    } catch {
      /* silent */
    }
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

  const handleChange = (field: keyof Filters, value: string) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
  };

  const handleSearch = () => applyFilters(filters);

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
        setWishlistIds((prev) => prev.filter((id) => id !== place._id));
        showToast("Removed from wishlist");
      } else {
        await API.post(`/wishlist/add/${place._id}`);
        setWishlistIds((prev) => [...prev, place._id]);
        showToast("Added to wishlist ❤️");
      }
    } catch {
      showToast("Error updating wishlist", "error");
    }
  };

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white";

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55 min-h-screen" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-black/60 backdrop-blur-sm">
        <button onClick={() => navigate("/dashboard")} className="text-white text-sm hover:underline">
          ← Dashboard
        </button>
        <span className="text-white font-semibold tracking-wide">🗺️ Explore Places</span>
        <div className="flex gap-3 items-center">
          <button onClick={() => navigate("/my-wishlist")} className="text-white text-sm hover:underline">❤️ Wishlist</button>
          <button
            onClick={() => { localStorage.clear(); navigate("/"); }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="relative z-10 pt-20 pb-10 px-6 max-w-6xl mx-auto">

        {/* ===== FILTER PANEL ===== */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            🔍 Advanced Filters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Min Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                className={inputCls}
                min={0}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Max Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                className={inputCls}
                min={0}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
                className={inputCls}
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r === "Any" ? "" : r}>
                    {r === "Any" ? "Any Rating" : `${r}★ & above`}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Goa, Kerala..."
                value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={inputCls}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className={inputCls}
              >
                {PLACE_TYPES.map((t) => (
                  <option key={t} value={t === "All" ? "" : t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 items-end">
              <button
                onClick={handleSearch}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* ===== RESULTS ===== */}
        <div>
          {/* Count header */}
          {!loading && searched && (
            <p className="text-white/80 text-sm mb-4">
              {places.length === 0
                ? "No places match your filters."
                : `Showing ${places.length} place${places.length > 1 ? "s" : ""}`}
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/30 rounded-2xl h-44 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && searched && places.length === 0 && (
            <div className="text-center bg-white/10 rounded-2xl py-16">
              <p className="text-white text-5xl mb-4">🔍</p>
              <p className="text-white text-xl font-semibold mb-2">No places found</p>
              <p className="text-white/70 text-sm mb-6">
                Try adjusting your filters or reset to see all places.
              </p>
              <button
                onClick={handleReset}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition"
              >
                Show All Places
              </button>
            </div>
          )}

          {/* Results grid */}
          {!loading && places.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {places.map((place) => (
                <div
                  key={place._id}
                  className="bg-white/92 backdrop-blur rounded-2xl shadow-lg p-5 flex flex-col gap-2 relative hover:shadow-2xl transition-shadow"
                >
                  {/* Type badge */}
                  {place.type && place.type !== "Other" && (
                    <span className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {place.type}
                    </span>
                  )}

                  {/* Wishlist heart */}
                  <button
                    onClick={(e) => toggleWishlist(e, place)}
                    className="absolute top-3 right-3 text-xl transition-transform hover:scale-125"
                    title={wishlistIds.includes(place._id) ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {wishlistIds.includes(place._id) ? "❤️" : "🤍"}
                  </button>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-800 mt-4 pr-8">{place.name}</h3>

                  {/* Location pill */}
                  <p className="text-sm text-gray-500">
                    📍{" "}
                    {[place.location, place.district, place.state]
                      .filter(Boolean)
                      .join(", ") || "Location not set"}
                  </p>

                  {/* Rating stars */}
                  <StarDisplay rating={place.rating} />

                  {/* Cost info */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500 text-xs block">Price</span>
                      <span className="font-bold text-gray-800">₹{place.price || "—"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500 text-xs block">Entry Fee</span>
                      <span className="font-bold text-gray-800">₹{place.entryFee || "—"}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
                      <span className="text-gray-500 text-xs block">Transport</span>
                      <span className="font-bold text-gray-800">₹{place.transportCost || "—"}</span>
                    </div>
                  </div>

                  {/* Book CTA */}
                  <button
                    onClick={() => navigate("/book-trip")}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-xl transition font-semibold"
                  >
                    Book This Trip
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
