import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    places: [
      {
        name: String,
        state: String,
        district: String,
        location: String,
        type: String,
        image: String,
        description: String,
        entryFee: Number,
        transportCost: Number,
        price: Number,
        rating: Number,
      },
    ],

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