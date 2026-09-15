// backend/src/models/SalaryTemplate.js
const mongoose = require("mongoose");

const salaryTemplateSchema = new mongoose.Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Array of field names required for employees using this template
    // e.g. ["pan", "uan", "pfNumber", "bankAccount", "ifsc", "department"]
    requiredFields: {
      type: [String],
      default: [],
    },
    // Default earnings components
    earningsSchema: [
      {
        label: { type: String, required: true },
        defaultAmount: { type: Number, default: 0 },
      },
    ],
    // Default deduction components
    deductionSchema: [
      {
        label: { type: String, required: true },
        defaultAmount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryTemplate", salaryTemplateSchema);
