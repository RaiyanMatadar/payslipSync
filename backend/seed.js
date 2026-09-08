// seed.js
// Run this once with "node seed.js" to insert the two sample templates
// mentioned in the project proposal (Template A and Template B).
// Makes it easy to test the dynamic form without creating templates by hand.

require("dotenv").config();
const mongoose = require("mongoose");
const SalaryTemplate = require("./models/SalaryTemplate");

const templates = [
  {
    templateKey: "corporate-detailed",
    templateName: "Corporate Detailed (Template A)",
    description: "Full compliance template for larger companies.",
    requiredFields: ["pan", "uan", "pfNumber", "bankAccount", "ifsc", "department"],
    earningsSchema: [
      { label: "Basic Pay", defaultAmount: 0 },
      { label: "HRA", defaultAmount: 0 },
      { label: "Allowances", defaultAmount: 0 },
    ],
    deductionSchema: [
      { label: "Provident Fund", defaultAmount: 0 },
      { label: "Professional Tax", defaultAmount: 0 },
      { label: "TDS", defaultAmount: 0 },
    ],
  },
  {
    templateKey: "minimalist-startup",
    templateName: "Minimalist Startup (Template B)",
    description: "Compact template for contractual/startup employees.",
    requiredFields: ["bankAccount"],
    earningsSchema: [
      { label: "Basic Pay", defaultAmount: 0 },
      { label: "Allowances", defaultAmount: 0 },
    ],
    deductionSchema: [{ label: "TDS", defaultAmount: 0 }],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding templates...");

  for (const t of templates) {
    await SalaryTemplate.findOneAndUpdate({ templateKey: t.templateKey }, t, {
      upsert: true,
      new: true,
    });
  }

  console.log("Done seeding.");
  process.exit();
}

seed();
