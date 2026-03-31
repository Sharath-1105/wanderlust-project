import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import bg from "../assets/travel-bg.jpeg";

export default function BookTrip() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const [days, setDays] = useState("");
  const [persons, setPersons] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);

  // ✅ FETCH PLACES FROM API
  const [placesData, setPlacesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ WISHLIST — IDs of saved places
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // ✅ TOAST STATE
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchPlaces();
    fetchWishlist();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await API.get("/places");
      setPlacesData(res.data);
    } catch {
      showToast("Error loading places", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH WISHLIST IDS
  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setWishlistIds(res.data.map((p: any) => p._id));
    } catch {
      // silently ignore if wishlist fails
    }
  };

  // ✅ TOGGLE WISHLIST
  const toggleWishlist = async (e: React.MouseEvent, place: any) => {
    e.preventDefault(); // don't trigger the label/checkbox
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

  const handleSelect = (place: any) => {
    const exists = selectedPlaces.find((p) => p.name === place.name);

    if (exists) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.name !== place.name));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleSubmit = async () => {
    if (!days || !persons) return showToast("Enter days and persons", "error");
    if (!startDate) return showToast("Select a start date", "error");
    if (selectedPlaces.length === 0) return showToast("Select at least one place", "error");

    try {
      await API.post("/trips", {
        places: selectedPlaces,
        days,
        persons,
        startDate,
      });

      showToast("Trip Booked Successfully! 🎉");

      // Navigate after toast is visible briefly
      setTimeout(() => navigate("/my-trips"), 1500);
    } catch {
      showToast("Error booking trip", "error");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-6 py-3 bg-black/60 backdrop-blur-sm">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white text-sm hover:underline"
        >
          ← Dashboard
        </button>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/my-wishlist")}
            className="text-white text-sm hover:underline"
          >
            ❤️ Wishlist
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white/90 p-8 rounded-xl shadow w-96 mt-16">

        <h2 className="text-xl font-bold mb-4 text-center">
          Book Trip
        </h2>

        <input
          type="number"
          placeholder="Days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="number"
          placeholder="Persons"
          value={persons}
          onChange={(e) => setPersons(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        {/* ✅ PLACES FROM API */}
        <div className="mb-3">
          <p className="font-semibold mb-2">Select Places:</p>

          {loading && (
            <p className="text-gray-500 text-sm">Loading places...</p>
          )}

          {!loading && placesData.length === 0 && (
            <p className="text-gray-500 text-sm italic">
              No places available. Admin needs to add places first.
            </p>
          )}

          {placesData.map((place, i) => (
            <label key={i} className="block border p-2 rounded mb-2 cursor-pointer hover:bg-gray-50 relative">

              {/* ❤️ Wishlist heart button */}
              <button
                type="button"
                onClick={(e) => toggleWishlist(e, place)}
                className="absolute top-2 right-2 text-lg leading-none transition-transform hover:scale-125"
                title={wishlistIds.includes(place._id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlistIds.includes(place._id) ? "❤️" : "🤍"}
              </button>

              <input
                type="checkbox"
                className="mr-2"
                checked={!!selectedPlaces.find((p) => p.name === place.name)}
                onChange={() => handleSelect(place)}
              />

              <span className="font-medium">{place.name}</span>

              {/* ✅ ENTRY FEE & TRANSPORT — always visible */}
              <div className="text-sm text-gray-600 ml-6 mt-1">
                Entry Fee: ₹{place.entryFee} <br />
                Transport: ₹{place.transportCost}
              </div>

              {place.state && (
                <div className="text-xs text-gray-400 ml-6">
                  {place.district}, {place.state}
                </div>
              )}

            </label>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700 transition"
        >
          Book Trip
        </button>
      </div>
    </div>
  );
}