// backend/src/routes/templateRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/templateController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getTemplates);
router.get("/:id", protect, getTemplateById);
router.post("/", protect, createTemplate);
router.put("/:id", protect, updateTemplate);
router.delete("/:id", protect, deleteTemplate);

module.exports = router;
