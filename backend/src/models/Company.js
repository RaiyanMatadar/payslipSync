// backend/src/models/Company.js
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/encryption");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contactNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    // Sensitive fields - encrypted in database
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    website: { type: String, default: "" },
    logoUrl: { type: String, default: "" },

    // Which template this company currently uses for new employees/slips
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryTemplate",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Encrypt sensitive fields on pre-save
companySchema.pre("save", function (next) {
  if (this.isModified("gstin") && this.gstin) {
    this.gstin = encrypt(this.gstin);
  }
  if (this.isModified("pan") && this.pan) {
    this.pan = encrypt(this.pan);
  }
  next();
});

// Decrypt on find/init
companySchema.post(["init", "save"], function (doc) {
  if (doc) {
    if (doc.gstin) doc.gstin = decrypt(doc.gstin);
    if (doc.pan) doc.pan = decrypt(doc.pan);
  }
});

module.exports = mongoose.model("Company", companySchema);
