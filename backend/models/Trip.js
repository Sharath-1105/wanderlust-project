import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    places: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // ── Trip details ────────────────────────────────────────
    days:    { type: Number, required: true },
    persons: { type: Number, required: true },

    fromLocation: { type: String, default: "" },
    transport:    { type: String, enum: ["Car", "Bus", "Train", ""], default: "" },
    distance:     { type: Number, default: 0 },        // km one-way (legacy)
    totalDistance:{ type: Number, default: 0 },        // km full route (from → p1 → p2 → ...)

    // ── Cost breakdown ────────────────────────────────────────
    placeCost:     { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    foodCost:      { type: Number, default: 0 },
    totalCost:     { type: Number, default: 0 },

    // ── Dates & status ────────────────────────────────────────
    startDate: Date,
    endDate:   Date,

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);