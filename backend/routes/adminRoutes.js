import express from "express";
import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Place from "../models/Place.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// 📊 ANALYTICS — OVERVIEW (existing, kept for Dashboard.tsx)
// ============================================================
router.get("/analytics", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalTrips = await Trip.countDocuments();
    const totalPlaces = await Place.countDocuments();

    res.json({ totalUsers, totalTrips, totalPlaces });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching analytics" });
  }
});

// ============================================================
// 📊 ANALYTICS — PLACES BY TYPE
// ============================================================
router.get("/analytics/places", verifyToken, isAdmin, async (req, res) => {
  try {
    const data = await Place.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching place analytics" });
  }
});

// ============================================================
// 📊 ANALYTICS — TRIPS PER DAY (last 7 days)
// ============================================================
router.get("/analytics/trips", verifyToken, isAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const data = await Trip.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching trip analytics" });
  }
});

// ============================================================
// 📊 ANALYTICS — USERS SUMMARY
// ============================================================
router.get("/analytics/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    res.json({ totalUsers, totalAdmins, total: totalUsers + totalAdmins });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user analytics" });
  }
});

// ============================================================
// 🗺️  PLACE CRUD
// ============================================================

// POST — Add Place
router.post("/place", verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      name, image, description, price, location, type,
      rating, state, district, entryFee, transportCost,
    } = req.body;

    if (!name) return res.status(400).json({ msg: "Place name is required" });

    const place = await Place.create({
      name,
      image: image || "",
      description: description || "",
      price: Number(price) || 0,
      location: location || "",
      type: type || "Other",
      rating: Number(rating) || 0,
      state: state || "",
      district: district || "",
      entryFee: Number(entryFee) || 0,
      transportCost: Number(transportCost) || 0,
    });

    res.json(place);
  } catch (err) {
    res.status(500).json({ msg: "Error adding place" });
  }
});

// PUT — Edit Place
router.put("/place/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!place) return res.status(404).json({ msg: "Place not found" });

    res.json(place);
  } catch (err) {
    res.status(500).json({ msg: "Error updating place" });
  }
});

// DELETE — Remove Place
router.delete("/place/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);

    if (!place) return res.status(404).json({ msg: "Place not found" });

    res.json({ msg: "Place deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting place" });
  }
});

// ============================================================
// 👥 USERS
// ============================================================
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users" });
  }
});

// ============================================================
// 🗺️  TRIPS (all)
// ============================================================
router.get("/trips", verifyToken, isAdmin, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching trips" });
  }
});

export default router;