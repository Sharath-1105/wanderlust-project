import express from "express";
import User from "../models/User.js";
import Place from "../models/Place.js";
import { verifyToken, isUser } from "../middleware/authMiddleware.js";

const router = express.Router();


// ❤️  GET MY WISHLIST  (populated with place details)
router.get("/", verifyToken, isUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching wishlist" });
  }
});


// ➕ ADD TO WISHLIST  (no duplicates)
router.post("/add/:placeId", verifyToken, isUser, async (req, res) => {
  try {
    const { placeId } = req.params;

    // Verify the place exists
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ msg: "Place not found" });

    const user = await User.findById(req.user._id);

    // Prevent duplicates
    const alreadySaved = user.wishlist.some(
      (id) => id.toString() === placeId
    );

    if (alreadySaved) {
      return res.status(400).json({ msg: "Already in wishlist" });
    }

    user.wishlist.push(placeId);
    await user.save();

    res.json({ msg: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ msg: "Error adding to wishlist" });
  }
});


// 🗑️  REMOVE FROM WISHLIST
router.delete("/remove/:placeId", verifyToken, isUser, async (req, res) => {
  try {
    const { placeId } = req.params;

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== placeId
    );

    await user.save();

    res.json({ msg: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ msg: "Error removing from wishlist" });
  }
});

export default router;
