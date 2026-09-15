// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "super_secret_payroll_jwt_key_2026_change_in_production",
    { expiresIn: "7d" }
  );
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    

    const trimmedIdentifier = (emailOrUsername || "").trim();
    const trimmedPassword = password || "";

    if (!trimmedIdentifier || !trimmedPassword) {
      return res.status(400).json({ message: "Please provide email/username and password" });
    }

    const isEmail = trimmedIdentifier.includes("@");
    const escaped = trimmedIdentifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = isEmail
      ? { email: trimmedIdentifier.toLowerCase() }
      : {
          $or: [
            { username: { $regex: new RegExp(`^${escaped}$`, "i") } },
            { email: trimmedIdentifier.toLowerCase() },
          ],
        };

    const admin = await Admin.findOne(query);

    if (!admin || !(await admin.matchPassword(trimmedPassword))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
      },
      token: generateToken(admin._id),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register (for initial administrator setup)
const register = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedUsername = (username || "").trim().toLowerCase();
    const trimmedPassword = password || "";

    if (!trimmedEmail || !trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email: trimmedEmail }, { username: trimmedUsername }],
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email or username already exists" });
    }

    const admin = await Admin.create({
      name: (name || "Admin").trim(),
      email: trimmedEmail,
      username: trimmedUsername,
      password: trimmedPassword,
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
      },
      token: generateToken(admin._id),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

module.exports = {
  login,
  register,
  getMe,
};
