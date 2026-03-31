import express from "express";
import Place from "../models/Place.js";

const router = express.Router();


// ➕ Add Place (Admin)
router.post("/add", async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.json(place);
  } catch (err) {
    res.status(500).json({ msg: "Error adding place" });
  }
});


// 🔍 Advanced Filter — MUST be before GET "/"
// GET /api/places/filter?minPrice=&maxPrice=&rating=&location=&type=
router.get("/filter", async (req, res) => {
  try {
    const { minPrice, maxPrice, rating, location, type } = req.query;

    const filter = {};

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Minimum rating
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Location — case-insensitive partial match
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Type — exact match
    if (type) {
      filter.type = type;
    }

    const places = await Place.find(filter).sort({ rating: -1 });

    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error filtering places" });
  }
});


// 📍 Get All Places (with optional state/district filter)
router.get("/", async (req, res) => {
  try {
    const { state, district } = req.query;

    const filter = {};
    if (state) filter.state = state;
    if (district) filter.district = district;

    const places = await Place.find(filter);

    res.json(places);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching places" });
  }
});

export default router;