import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-36 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-8 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function MyWishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlist(res.data);
    } catch (err: any) {
      showToast(err.response?.data?.msg || "Error fetching wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (placeId: string) => {
    try {
      await API.delete(`/wishlist/remove/${placeId}`);
      setWishlist((prev) => prev.filter((p) => p._id !== placeId));
      showToast("Removed from wishlist");
    } catch {
      showToast("Error removing from wishlist", "error");
    }
  };

  const TYPE_GRADIENT: Record<string, string> = {
    Beach:   "from-cyan-100 to-blue-100",
    Hill:    "from-emerald-100 to-green-100",
    City:    "from-violet-100 to-purple-100",
    Heritage:"from-amber-100 to-yellow-100",
    Forest:  "from-green-100 to-lime-100",
    Other:   "from-slate-100 to-slate-50",
  };
  const TYPE_EMOJI: Record<string, string> = {
    Beach: "🏖️", Hill: "⛰️", City: "🌆", Heritage: "🏛️", Forest: "🌿", Other: "📍",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar title="My Wishlist" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fade-in ${
          toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
            ❤️ My Wishlist
          </h1>
          <p className="text-slate-500 text-sm">Places you've saved — ready to book whenever you are</p>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && wishlist.length === 0 && (
          <div className="card p-16 text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-pulse">🤍</div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
            <p className="text-slate-500 text-sm mb-8">
              Tap the ❤️ on any place while exploring to save it here.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate("/explore")} className="btn-primary px-8">
                🗺️ Explore Places
              </button>
              <button onClick={() => navigate("/book-trip")} className="btn-secondary px-8">
                📋 Browse & Book
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((place, i) => (
              <div
                key={place._id}
                className="card overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Image / gradient */}
                <div className={`h-36 flex items-center justify-center text-5xl bg-gradient-to-br ${
                  TYPE_GRADIENT[place.type] || TYPE_GRADIENT.Other
                } relative group-hover:brightness-95 transition-all`}>
                  {place.image ? (
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <span>{TYPE_EMOJI[place.type] || "📍"}</span>
                  )}
                  {/* Remove heart */}
                  <button
                    onClick={() => handleRemove(place._id)}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                  >
                    ❤️
                  </button>
                </div>

                <div className="p-5">
                  <h2 className="font-bold text-slate-800 text-base mb-1 line-clamp-1">{place.name}</h2>
                  {place.district && (
                    <p className="text-sm text-slate-500 mb-3">
                      📍 {place.district}, {place.state}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <span className="text-slate-400 block">Entry Fee</span>
                      <span className="font-bold text-slate-700">₹{place.entryFee || "—"}</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <span className="text-slate-400 block">Transport</span>
                      <span className="font-bold text-slate-700">₹{place.transportCost || "—"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/book-trip")}
                    className="w-full btn-primary py-2.5 text-sm"
                  >
                    Book This Place
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
