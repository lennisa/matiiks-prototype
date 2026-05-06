const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  rating: { type: Number, default: 1000 },
});

module.exports = mongoose.model("User", userSchema);
