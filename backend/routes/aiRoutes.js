import express from "express";
import { generateTripPlan } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/ai-trip
// Protected — must be logged in
router.post("/", verifyToken, generateTripPlan);

export default router;
