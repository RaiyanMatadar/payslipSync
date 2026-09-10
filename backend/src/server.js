// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const seedData = require("./utils/seed");

const authRoutes = require("./routes/authRoutes");
const companyRoutes = require("./routes/companyRoutes");
const templateRoutes = require("./routes/templateRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payslipRoutes = require("./routes/payslipRoutes");

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static directory for any fallback uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payslips", payslipRoutes);

// Root & Health Checks
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Payroll & Salary Slip Management System API",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.send("Payroll & Salary Slip Management System API is running...");
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after connecting to DB and seeding defaults
async function startServer() {
  try {
    await connectDB();
    // Auto-seed default admin and templates if empty
    await seedData(false);

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
