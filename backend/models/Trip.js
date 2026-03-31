import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    places: [
      {
        name: String,
        state: String,
        district: String,
        entryFee: Number,
        transportCost: Number,
      },
    ],

    days: Number,
    persons: Number,
    totalCost: Number,

    // ✅ ADDED
    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);