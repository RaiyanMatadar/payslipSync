const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

// store uploaded logos in /uploads with their original name + timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.post("/", upload.single("logo"), createCompany);
router.put("/:id", upload.single("logo"), updateCompany);
router.delete("/:id", deleteCompany);

module.exports = router;
