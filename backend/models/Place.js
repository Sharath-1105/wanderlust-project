const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  state: String,
  district: String,
  entryFee: Number,
  transportCost: Number
});

module.exports = mongoose.model("Place", placeSchema);