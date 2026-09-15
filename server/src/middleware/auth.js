// backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    // Allows direct browser downloads for PDFs and ZIP files
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super_secret_payroll_jwt_key_2026_change_in_production"
      );

      req.admin = await Admin.findById(decoded.id).select("-password");
      if (!req.admin) {
        return res.status(401).json({ message: "Admin account not found" });
      }

      return next();
    } catch (err) {
      console.error("JWT auth error:", err.message);
      return res.status(401).json({ message: "Not authorized, token failed or expired" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };
