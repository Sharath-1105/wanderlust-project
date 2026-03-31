const express = require("express");
const User = require("../models/User");
const Trip = require("../models/Trip");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// 📊 ADMIN ANALYTICS
router.get("/analytics", verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalTrips = await Trip.countDocuments();

    res.json({
      totalUsers,
      totalTrips
    });

  } catch (err) {
    res.status(500).json({ msg: "Error fetching analytics" });
  }
});

module.exports = router;