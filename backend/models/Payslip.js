// Payslip.js
// Important: this stores a SNAPSHOT of company + employee info at the time
// the payslip was generated. This way, if the employee's salary changes later
// or the company edits its profile, old payslips still show the old data.

const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
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

    month: { type: Number, required: true }, // 1 - 12
    year: { type: Number, required: true },

    workingDays: { type: Number, default: 30 },
    paidDays: { type: Number, default: 30 },
    lopDays: { type: Number, default: 0 }, // loss of pay days

    earnings: [lineItemSchema],
    deductions: [lineItemSchema],

    grossEarnings: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    netSalaryInWords: { type: String },

    // frozen copy of company + employee details so history never changes
    snapshotData: {
      companyName: String,
      companyAddress: String,
      companyLogoUrl: String,
      companyGstin: String,
      companyPan: String,
      employeeName: String,
      employeeCode: String,
      designation: String,
      department: String,
      bankAccount: String,
      ifsc: String,
      customFields: Object,
    },
  },
  { timestamps: true }
);

// stop the same employee getting two payslips for the same month/year
payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payslip", payslipSchema);
