import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import bg from "../assets/travel-bg.jpeg";

export default function BookTrip() {
  const navigate = useNavigate();

  const [days, setDays] = useState("");
  const [persons, setPersons] = useState("");

  // ✅ ADDED
  const [startDate, setStartDate] = useState("");

  const placesData = [
    { name: "Mysore Palace", entryFee: 50, transportCost: 100 },
    { name: "Mysore Zoo", entryFee: 30, transportCost: 80 },
    { name: "Mysore Exhibition", entryFee: 20, transportCost: 50 },
  ];

  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);

  const handleSelect = (place: any) => {
    const exists = selectedPlaces.find((p) => p.name === place.name);

    if (exists) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.name !== place.name));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleSubmit = async () => {
    if (!days || !persons) return alert("Enter details");
    if (!startDate) return alert("Select date");
    if (selectedPlaces.length === 0) return alert("Select places");

    try {
      await API.post("/trips", {
        places: selectedPlaces,
        days,
        persons,
        startDate, // ✅ ADDED
      });

      alert("Trip Booked!");
      navigate("/my-trips");
    } catch {
      alert("Error booking trip");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-white/90 p-8 rounded-xl shadow w-96">

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

        {/* ✅ ADDED DATE */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

       <div className="mb-3">
  <p className="font-semibold mb-2">Select Places:</p>

  {placesData.map((place, i) => (
    <label key={i} className="block border p-2 rounded mb-2 cursor-pointer">

      <input
        type="checkbox"
        className="mr-2"
        onChange={() => handleSelect(place)}
      />

      <span className="font-medium">{place.name}</span>

      <div className="text-sm text-gray-600 ml-6">
        Entry Fee: ₹{place.entryFee} <br />
        Transport: ₹{place.transportCost}
      </div>

    </label>
  ))}
</div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white w-full p-2 rounded"
        >
          Book Trip
        </button>
      </div>
    </div>
  );
}