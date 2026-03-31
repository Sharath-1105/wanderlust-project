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

    if (!places || places.length === 0) {
      return res.status(400).json({ msg: "Select places" });
    }

    if (!startDate) {
      return res.status(400).json({ msg: "Select start date" });
    }

    let totalCost = 0;

    places.forEach((p) => {
      totalCost += (p.entryFee + p.transportCost) * persons * days;
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
    console.log(err);
    res.status(500).json({ msg: "Error booking trip" });
  }
});


// ================= GET MY TRIPS =================
router.get("/", verifyToken, isUser, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id });

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