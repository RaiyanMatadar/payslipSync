// backend/src/routes/companyRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  lookupLogo,
} = require("../controllers/companyController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/lookup-logo", lookupLogo);

router.get("/", protect, getCompanies);
router.get("/:id", protect, getCompanyById);
router.post("/", protect, upload.single("logo"), createCompany);
router.put("/:id", protect, upload.single("logo"), updateCompany);
router.delete("/:id", protect, deleteCompany);

module.exports = router;
