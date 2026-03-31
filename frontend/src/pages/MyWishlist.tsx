import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function MyWishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

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

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
            toast.type === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            ❤️ My Wishlist
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-white border border-white px-4 py-2 rounded hover:bg-white/20 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => { localStorage.clear(); navigate("/"); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-white text-center">Loading wishlist...</p>
        )}

        {/* Empty */}
        {!loading && wishlist.length === 0 && (
          <div className="text-center bg-white/10 rounded-2xl p-12">
            <p className="text-white text-5xl mb-4">🤍</p>
            <p className="text-white text-xl font-semibold mb-2">
              Your wishlist is empty
            </p>
            <p className="text-white/70 mb-6">
              Tap the heart ❤️ on any place while booking to save it here.
            </p>
            <button
              onClick={() => navigate("/book-trip")}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition"
            >
              Browse Places
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((place) => (
            <div
              key={place._id}
              className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-5 flex flex-col gap-2"
            >
              {/* Place header */}
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-gray-800">{place.name}</h2>
                <button
                  onClick={() => handleRemove(place._id)}
                  title="Remove from wishlist"
                  className="text-red-500 hover:text-red-700 text-xl transition"
                >
                  ❤️
                </button>
              </div>

              {/* Location */}
              {place.district && (
                <p className="text-sm text-gray-500">
                  📍 {place.district}, {place.state}
                </p>
              )}

              {/* Fee info */}
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                <div className="flex justify-between bg-gray-100 rounded px-3 py-1">
                  <span>Entry Fee</span>
                  <span className="font-semibold">₹{place.entryFee}</span>
                </div>
                <div className="flex justify-between bg-gray-100 rounded px-3 py-1">
                  <span>Transport</span>
                  <span className="font-semibold">₹{place.transportCost}</span>
                </div>
              </div>

              {/* Book now CTA */}
              <button
                onClick={() => navigate("/book-trip")}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded-xl transition"
              >
                Book This Place
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
