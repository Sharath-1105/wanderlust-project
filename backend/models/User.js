import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
  ],
});

export default mongoose.model("User", userSchema);