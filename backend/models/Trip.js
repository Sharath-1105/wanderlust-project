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

    days: { type: Number, required: true },
    persons: { type: Number, required: true },
    totalCost: Number,

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);