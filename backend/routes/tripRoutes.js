import express from "express";
import Trip from "../models/Trip.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { calcCosts } from "../utils/costUtils.js";

const router = express.Router();

// ─── Status helper ────────────────────────────────────────────
const getStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "upcoming";
  const today = new Date();
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (today < start)                    return "upcoming";
  if (today >= start && today <= end)   return "ongoing";
  return "completed";
};


// ================= BOOK TRIP =================
router.post("/", verifyToken, async (req, res) => {
  try {
    let { places, days, persons, startDate,
          fromLocation, transport, distance } = req.body;

    // ── Defensive JSON parsing (AI trip sends serialised arrays) ──
    if (typeof places === "string") {
      try { places = JSON.parse(places); } catch { places = []; }
    }
    if (Array.isArray(places) && places.length === 1 && typeof places[0] === "string") {
      try { places = JSON.parse(places[0]); } catch {}
    }

    console.log("[BOOK TRIP] user:", req.user?._id, "| places:", Array.isArray(places) ? places.length : typeof places);

    // ── Validation ─────────────────────────────────────────────
    if (!places || !Array.isArray(places) || places.length === 0)
      return res.status(400).json({ msg: "Select at least 1 place" });

    if (!startDate)
      return res.status(400).json({ msg: "Select start date" });

    if (!days || Number(days) < 1)
      return res.status(400).json({ msg: "Days must be at least 1" });

    if (!persons || Number(persons) < 1)
      return res.status(400).json({ msg: "Persons must be at least 1" });

    const maxPlaces = Number(days) * 3;
    if (places.length > maxPlaces)
      return res.status(400).json({
        msg: `Too many places. Max ${maxPlaces} for ${days} day(s) (3/day limit)`,
      });

    // ── Cost calculation ───────────────────────────────────────
    const costs = calcCosts({
      places,
      days:      Number(days),
      persons:   Number(persons),
      transport: transport || "",
      distance:  Number(distance) || 0,
    });

    // ── End date & status ──────────────────────────────────────
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(days));
    const status = getStatus(startDate, endDate);

    const trip = new Trip({
      userId: req.user._id,
      places,
      days:          Number(days),
      persons:       Number(persons),
      fromLocation:  fromLocation || "",
      transport:     transport    || "",
      distance:      Number(distance) || 0,
      placeCost:     costs.placeCost,
      transportCost: costs.transportCost,
      foodCost:      costs.foodCost,
      totalCost:     costs.totalCost,
      startDate,
      endDate,
      status,
    });

    await trip.save();
    console.log("[BOOK TRIP] ✅ saved trip:", trip._id, "| totalCost:", costs.totalCost);
    res.json(trip);
  } catch (err) {
    console.error("[BOOK TRIP] ❌ ERROR:", err?.message);
    res.status(500).json({ msg: err?.message || "Error booking trip" });
  }
});


// ================= GET MY TRIPS =================
router.get("/", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const updatedTrips = trips.map((trip) => ({
      ...trip._doc,
      status: getStatus(trip.startDate, trip.endDate),
    }));
    res.json(updatedTrips);
  } catch {
    res.status(500).json({ msg: "Error fetching trips" });
  }
});

export default router;