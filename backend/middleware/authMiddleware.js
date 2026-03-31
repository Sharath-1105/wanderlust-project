const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🔐 VERIFY TOKEN
exports.verifyToken = async (req, res, next) => {
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
exports.isUser = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ msg: "Access denied (User only)" });
  }
  next();
};


// 👨‍💼 ADMIN ONLY
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied (Admin only)" });
  }
  next();
};