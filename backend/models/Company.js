// Company.js
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String },
    address: { type: String },
    gstin: { type: String },
    pan: { type: String },
    website: { type: String },
    logoUrl: { type: String, default: "" }, // path to uploaded logo

    // which template this company currently uses for its payslips
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryTemplate",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
