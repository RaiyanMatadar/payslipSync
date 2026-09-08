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
} = require("../controllers/payslipController");

router.post("/preview", previewPayslip); // live recalculation, nothing saved
router.post("/bulk", createBulkPayslips); // date range generation

router.get("/", getPayslips);
router.get("/:id", getPayslipById);
router.get("/:id/pdf", downloadPayslipPDF);
router.post("/", createPayslip);
router.put("/:id", updatePayslip);
router.delete("/:id", deletePayslip);

module.exports = router;
