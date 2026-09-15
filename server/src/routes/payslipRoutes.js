// backend/src/routes/payslipRoutes.js
const express = require("express");
const router = express.Router();
const {
  previewPayslip,
  createPayslip,
  createBulkPayslips,
  getPayslips,
  getPayslipById,
  updatePayslip,
  deletePayslip,
  downloadPayslipPDF,
  exportBulkPayslipsZip,
} = require("../controllers/payslipController");
const { protect } = require("../middleware/auth");

// Live recalculation during WYSIWYG document editing
router.post("/preview", previewPayslip);

// Bulk payslips generation across date range
router.post("/bulk", protect, createBulkPayslips);

// Bulk ZIP export
router.get("/export/zip", protect, exportBulkPayslipsZip);

// Single PDF download
router.get("/:id/pdf", protect, downloadPayslipPDF);

// Standard CRUD
router.get("/", protect, getPayslips);
router.get("/:id", protect, getPayslipById);
router.post("/", protect, createPayslip);
router.put("/:id", protect, updatePayslip);
router.delete("/:id", protect, deletePayslip);

module.exports = router;
