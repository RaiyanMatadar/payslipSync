// server.js - entry point for the backend

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const companyRoutes = require("./routes/companyRoutes");
const templateRoutes = require("./routes/templateRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payslipRoutes = require("./routes/payslipRoutes");

const app = express();

// connect to mongodb
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded company logos statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/companies", companyRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payslips", payslipRoutes);

app.get("/", (req, res) => {
  res.send("Payroll Management System API is running...");
});

// error handler should always be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
