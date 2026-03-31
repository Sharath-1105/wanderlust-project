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
router.post("/", verifyToken, isUser, async (req, res) => {
  try {
    const { places, days, persons, startDate } = req.body;

    // ✅ VALIDATION: must select at least 1 place
    if (!places || places.length === 0) {
      return res.status(400).json({ msg: "Select at least 1 place" });
    }

    if (!startDate) {
      return res.status(400).json({ msg: "Select start date" });
    }

    if (!days || Number(days) < 1) {
      return res.status(400).json({ msg: "Days must be at least 1" });
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
    console.error(err);
    res.status(500).json({ msg: "Error booking trip" });
  }
});


// ================= GET MY TRIPS =================
router.get("/", verifyToken, isUser, async (req, res) => {
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