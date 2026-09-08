// Employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employeeCode: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String },
    designation: { type: String },
    department: { type: String },
    joiningDate: { type: Date },

    // these are the fields that only exist depending on the company's template
    // e.g { pan: "ABCDE1234F", uan: "1001XXXX", pf: "PF123" }
    // stored as a plain object because different templates need different keys
    customFields: {
      type: Map,
      of: String,
      default: {},
    },

    // baseline / default salary structure used to pre-fill a new payslip
    baseSalary: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
    },

    bankAccount: { type: String },
    ifsc: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
