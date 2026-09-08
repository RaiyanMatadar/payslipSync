// SalaryTemplate.js
// This model stores the different payslip templates a company can pick from.
// Each template decides which employee fields are required (this is what makes
// the employee form "dynamic" on the frontend).

const mongoose = require("mongoose");

const salaryTemplateSchema = new mongoose.Schema(
  {
    templateKey: {
      type: String,
      required: true,
      unique: true, // e.g. "corporate-detailed", "minimalist-startup"
    },
    templateName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    // list of field names that MUST be filled when this template is active
    // frontend reads this array to decide which inputs to show
    requiredFields: {
      type: [String],
      default: [],
    },
    // default earning heads that show up when generating a payslip
    earningsSchema: [
      {
        label: String,
        defaultAmount: { type: Number, default: 0 },
      },
    ],
    // default deduction heads
    deductionSchema: [
      {
        label: String,
        defaultAmount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryTemplate", salaryTemplateSchema);
