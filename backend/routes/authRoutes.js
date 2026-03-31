import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();


// 🔐 REGISTER (USER ONLY)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user"
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error registering user" });
  }
});


// 🔐 USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.role !== "user") {
      return res.status(400).json({ msg: "Invalid user login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ msg: "Login error" });
  }
});


// 🔐 ADMIN LOGIN (SEPARATE)
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin") {
      return res.status(400).json({ msg: "Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

    res.json({ token, role: admin.role });

  } catch (err) {
    res.status(500).json({ msg: "Admin login error" });
  }
});

export default router;