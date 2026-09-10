// backend/src/utils/seed.js
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { connectDB, disconnectDB } = require("../config/db");
const Admin = require("../models/Admin");
const SalaryTemplate = require("../models/SalaryTemplate");

const sampleTemplates = [
  {
    templateKey: "corporate-detailed",
    templateName: "Corporate Detailed (Template A)",
    description: "Full compliance template requiring PAN, PF, UAN, and banking details.",
    requiredFields: ["pan", "uan", "pfNumber", "bankAccount", "ifsc", "department"],
    earningsSchema: [
      { label: "Basic Pay", defaultAmount: 30000 },
      { label: "HRA", defaultAmount: 12000 },
      { label: "Allowances", defaultAmount: 8000 },
    ],
    deductionSchema: [
      { label: "Provident Fund", defaultAmount: 1800 },
      { label: "Professional Tax", defaultAmount: 200 },
      { label: "TDS", defaultAmount: 1500 },
    ],
  },
  {
    templateKey: "minimalist-startup",
    templateName: "Minimalist Startup (Template B)",
    description: "Streamlined template for contractual team members and fast-moving startups.",
    requiredFields: ["bankAccount"],
    earningsSchema: [
      { label: "Basic Pay", defaultAmount: 40000 },
      { label: "Allowances", defaultAmount: 10000 },
    ],
    deductionSchema: [{ label: "TDS", defaultAmount: 2500 }],
  },
];

async function seedData(autoClose = true) {
  try {
    await connectDB();
    console.log("Seeding database...");

    // 1. Seed Default Admin if none exists
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultAdmin = new Admin({
    // 1. Seed or sync Default Admin (admin@payroll.com / admin123)
    let defaultAdmin = await Admin.findOne({
      $or: [{ email: "admin@payroll.com" }, { username: "admin" }],
    });

    if (!defaultAdmin) {
      defaultAdmin = new Admin({
        name: "System Administrator",
        email: "admin@payroll.com",
        username: "admin",
        password: "admin123", // Pre-save hook will hash this
      });
      await defaultAdmin.save();
      console.log("Created default admin user: admin@payroll.com (password: admin123)");
    } else {
      console.log("Admin account already exists.");
      defaultAdmin.username = "admin";
      defaultAdmin.password = "admin123";
      await defaultAdmin.save();
      console.log("Synchronized default admin user: admin@payroll.com (password: admin123)");
    }

    // 2. Upsert Templates
    for (const t of sampleTemplates) {
      await SalaryTemplate.findOneAndUpdate({ templateKey: t.templateKey }, t, {
        upsert: true,
        new: true,
      });
    }
    console.log(`Seeded ${sampleTemplates.length} default salary templates.`);

    console.log("Seeding completed successfully.");
    if (autoClose) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error("Seeding error:", err);
    if (autoClose) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
