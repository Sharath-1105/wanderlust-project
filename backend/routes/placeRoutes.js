const express = require("express");
const Place = require("../models/Place");

const router = express.Router();


// ➕ Add Place
router.post("/add", async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.json(place);
  } catch (err) {
    res.status(500).json({ msg: "Error adding place" });
  }
});


// 📍 Get Places by State & District
router.get("/", async (req, res) => {
  try {
    const { state, district } = req.query;

    const places = await Place.find({ state, district });

    res.json(places);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching places" });
  }
});

module.exports = router;