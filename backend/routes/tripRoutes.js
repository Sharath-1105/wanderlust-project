import express from "express";
import Trip from "../models/Trip.js";
import { verifyToken, isUser } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ STATUS FUNCTION
const getStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "upcoming";

  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) return "upcoming";
  if (today >= start && today <= end) return "ongoing";
  return "completed";
};


// ================= BOOK TRIP =================
router.post("/", verifyToken, async (req, res) => {
  try {
    let { places, days, persons, startDate } = req.body;

    // Log everything for diagnosis
    console.log("[BOOK TRIP] user:", req.user?._id, "role:", req.user?.role);
    console.log("[BOOK TRIP] days:", days, "persons:", persons, "startDate:", startDate);
    console.log("[BOOK TRIP] places type:", typeof places, "isArray:", Array.isArray(places));
    if (Array.isArray(places)) {
      console.log("[BOOK TRIP] places count:", places.length);
      console.log("[BOOK TRIP] places[0] type:", typeof places[0], JSON.stringify(places[0])?.slice(0, 100));
    } else {
      console.log("[BOOK TRIP] places value:", String(places).slice(0, 200));
    }

    // Defensive: if places came in as a JSON string, parse it
    if (typeof places === "string") {
      try { places = JSON.parse(places); } catch { places = []; }
    }
    // Defensive: if it's a nested single-element string array
    if (Array.isArray(places) && places.length === 1 && typeof places[0] === "string") {
      try { places = JSON.parse(places[0]); } catch { /** keep as-is */ }
    }

    // ✅ VALIDATION: must select at least 1 place
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ msg: "Select at least 1 place" });
    }

    if (!startDate) {
      return res.status(400).json({ msg: "Select start date" });
    }

    if (!days || Number(days) < 1) {
      return res.status(400).json({ msg: "Days must be at least 1" });
    }

    if (!persons || Number(persons) < 1) {
      return res.status(400).json({ msg: "Persons must be at least 1" });
    }

    // ✅ VALIDATION: max 3 places per day
    const maxPlaces = Number(days) * 3;
    if (places.length > maxPlaces) {
      return res.status(400).json({
        msg: `Too many places. Max ${maxPlaces} place(s) for ${days} day(s) (3 per day limit)`,
      });
    }

    let totalCost = 0;

    places.forEach((p) => {
      totalCost += (Number(p.entryFee || 0) + Number(p.transportCost || 0)) * Number(persons) * Number(days);
    });

    // ✅ CALCULATE END DATE
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(days));

    const status = getStatus(startDate, endDate);

    const trip = new Trip({
      userId: req.user._id,
      places,
      days,
      persons,
      totalCost,
      startDate,
      endDate,
      status,
    });

    await trip.save();

    res.json(trip);
  } catch (err) {
    console.error("Trip booking error:", err?.message || err);
    res.status(500).json({ msg: "Error booking trip", detail: err?.message });
  }
});


// ================= GET MY TRIPS =================
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const updatedTrips = trips.map((trip) => {
      const status = getStatus(trip.startDate, trip.endDate);
      return { ...trip._doc, status };
    });

    res.json(updatedTrips);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching trips" });
  }
});

export default router;