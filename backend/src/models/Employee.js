// backend/src/models/Employee.js
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employeeCode: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    designation: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    joiningDate: { type: Date, default: Date.now },

    // Dynamic fields mandated by the company's active template
    // e.g. { pan: "...", uan: "...", pfNumber: "..." }
    customFields: {
      type: Map,
      of: String,
      default: {},
    },

    // Baseline compensation structure
    baseSalary: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
    },

    bankAccount: { type: String, default: "" },
    ifsc: { type: String, default: "" },
  },
  { timestamps: true }
);

// Encrypt any sensitive custom fields like pan, uan, pfNumber
employeeSchema.pre("save", function (next) {
  if (this.customFields && this.customFields instanceof Map) {
    const sensitiveKeys = ["pan", "uan", "pfNumber", "aadhar"];
    for (const key of sensitiveKeys) {
      if (this.customFields.has(key)) {
        const val = this.customFields.get(key);
        if (val) {
          this.customFields.set(key, encrypt(val));
        }
      }
    }
  }
  next();
});

// Decrypt on retrieval
employeeSchema.post(["init", "save"], function (doc) {
  if (doc && doc.customFields && doc.customFields instanceof Map) {
    const sensitiveKeys = ["pan", "uan", "pfNumber", "aadhar"];
    for (const key of sensitiveKeys) {
      if (doc.customFields.has(key)) {
        const val = doc.customFields.get(key);
        if (val) {
          doc.customFields.set(key, decrypt(val));
        }
      }
    }
  }
});

// Compound index to ensure unique employee code per company
employeeSchema.index({ companyId: 1, employeeCode: 1 }, { unique: true });

module.exports = mongoose.model("Employee", employeeSchema);
