import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 VERIFY TOKEN
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};


// 👤 USER ONLY
export const isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ msg: "Access denied (User only)" });
  }
  next();
};


// 👨‍💼 ADMIN ONLY
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied (Admin only)" });
  }
  next();
};