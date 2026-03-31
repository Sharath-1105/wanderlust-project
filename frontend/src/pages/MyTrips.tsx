import { useEffect, useState } from "react";
import API from "../services/api";
import bg from "../assets/travel-bg.jpeg";

export default function MyTrips() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips");
      setTrips(res.data);
    } catch {
      alert("Error fetching trips");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          My Trips
        </h1>

        {trips.length === 0 && (
          <div className="text-white text-center">No trips found</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {trips.map((trip) => (
            <div key={trip._id} className="bg-white/90 p-6 rounded-2xl shadow">

              <h2 className="text-xl font-bold mb-3">
                Trip Summary
              </h2>

              <p><b>Days:</b> {trip.days}</p>
              <p><b>Persons:</b> {trip.persons}</p>
              <p><b>Total Cost:</b> ₹{trip.totalCost}</p>

              <p>
                <b>Status:</b>{" "}
                <span
                  className={
                    trip.status === "upcoming"
                      ? "text-blue-600"
                      : trip.status === "ongoing"
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {trip.status}
                </span>
              </p>

              <p><b>Start:</b> {trip.startDate ? new Date(trip.startDate).toDateString() : "-"}</p>
<p><b>End:</b> {trip.endDate ? new Date(trip.endDate).toDateString() : "-"}</p> 

              {/* ✅ FIXED PLACES DISPLAY */}
              <h3 className="font-semibold mt-3">Places:</h3>

             <ul className="list-disc ml-5">
  {trip.places.map((place: any, i: number) => (
    <li key={i}>
      <b>{place.name}</b> <br />
      Entry Fee: ₹{place.entryFee} | Transport: ₹{place.transportCost}
    </li>
  ))}
</ul>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}