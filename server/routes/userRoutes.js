const express = require("express");
const User = require("../models/User.js");

const router = express.Router();

router.post("/auth", async (req, res) => {
  try {
    const { uid, email, name, photo } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, email, name, photo });
      await user.save();
    } else {
      user.email = email;
      user.name = name;
      user.photo = photo;
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("User auth error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
