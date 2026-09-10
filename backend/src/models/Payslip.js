// backend/src/models/Payslip.js
const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    workingDays: { type: Number, default: 30 },
    paidDays: { type: Number, default: 30 },
    lopDays: { type: Number, default: 0 },

    earnings: [lineItemSchema],
    deductions: [lineItemSchema],

    grossEarnings: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    netSalaryInWords: { type: String, default: "" },

    // Immutable snapshot of company + employee details at generation time
    snapshotData: {
      companyName: { type: String, default: "" },
      companyAddress: { type: String, default: "" },
      companyLogoUrl: { type: String, default: "" },
      companyGstin: { type: String, default: "" },
      companyPan: { type: String, default: "" },
      companyEmail: { type: String, default: "" },
      companyContactNumber: { type: String, default: "" },

      employeeName: { type: String, default: "" },
      employeeCode: { type: String, default: "" },
      designation: { type: String, default: "" },
      department: { type: String, default: "" },
      bankAccount: { type: String, default: "" },
      ifsc: { type: String, default: "" },

      notes: { type: String, default: "This is a computer-generated payslip and does not require a physical signature." },
      signatoryTitle: { type: String, default: "Authorized Signatory" },
      customFields: { type: Object, default: {} },
    },
  },
  { timestamps: true }
);

// Prevent duplicate payslip for the same employee in the same month & year
payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);
