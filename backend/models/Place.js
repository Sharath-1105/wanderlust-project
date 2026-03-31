import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  // Core fields
  name: String,
  state: String,
  district: String,
  entryFee: { type: Number, default: 0 },
  transportCost: { type: Number, default: 0 },

  // Rich content
  image: { type: String, default: "" },
  description: { type: String, default: "" },

  // Filter/search fields
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  location: { type: String, default: "" },
  type: {
    type: String,
    enum: ["Beach", "Hill", "City", "Forest", "Heritage", "Other"],
    default: "Other",
  },
}, { timestamps: true });

export default mongoose.model("Place", placeSchema);