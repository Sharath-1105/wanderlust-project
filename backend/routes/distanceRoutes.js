// ─── distanceRoutes.js ────────────────────────────────────────────────────────
// GET /api/distance
// Computes the total road distance for a full journey:
//   fromLocation → place1 → place2 → ...
// Uses Nominatim + OSRM with coordinate caching.

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getRouteDistance, DEFAULT_DISTANCE_KM } from "../utils/geoUtils.js";

const router = express.Router();

/**
 * GET /api/distance
 * Query params:
 *   fromLocation  – origin city/place (string)
 *   places        – comma-separated list of destination place names
 *
 * Response:
 *   { totalDistanceKm, legs[], cached }
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { fromLocation, places } = req.query;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!fromLocation || typeof fromLocation !== "string" || !fromLocation.trim()) {
      return res.status(400).json({ msg: "fromLocation is required" });
    }

    let placeNames = [];
    if (places) {
      // Accept comma-separated string or repeated query params: ?places=A&places=B
      if (Array.isArray(places)) {
        placeNames = places.filter(Boolean);
      } else {
        placeNames = places.split(",").map((p) => p.trim()).filter(Boolean);
      }
    }

    if (placeNames.length === 0) {
      return res.status(400).json({ msg: "At least one place is required" });
    }

    console.log(`[DISTANCE] ${fromLocation} → [${placeNames.join(", ")}]`);

    // ── Compute ───────────────────────────────────────────────────────────────
    const { totalKm, legs } = await getRouteDistance(fromLocation.trim(), placeNames);

    return res.json({
      fromLocation: fromLocation.trim(),
      places: placeNames,
      totalDistanceKm: totalKm,
      legs,
    });
  } catch (err) {
    console.error("[DISTANCE] Error:", err?.message);

    // Surface user-friendly error for "location not found"
    if (err?.message?.toLowerCase().includes("not found")) {
      return res.status(400).json({ msg: err.message });
    }

    // Generic fallback — still return a usable value so UI doesn't break
    return res.status(200).json({
      totalDistanceKm: DEFAULT_DISTANCE_KM,
      legs: [],
      fallback: true,
      msg: "Could not calculate real-time distance. Using estimated 200 km.",
    });
  }
});

export default router;
