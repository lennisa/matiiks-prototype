const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: "Fields cannot be empty" });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.json({ error: "User exists" });

    const user = new User({
      username,
      password,
      rating: 1000,
    });

    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    let { username, password } = req.body;

    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password cannot be empty",
      });
    }

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (user.rating === undefined || user.rating === null) {
      user.rating = 1000;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        rating: user.rating,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

module.exports = router;
