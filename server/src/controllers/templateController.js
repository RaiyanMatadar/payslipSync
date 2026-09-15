// backend/src/controllers/templateController.js
const SalaryTemplate = require("../models/SalaryTemplate");

// GET /api/templates
const getTemplates = async (req, res, next) => {
  try {
    const templates = await SalaryTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    next(err);
  }
};

// GET /api/templates/:id
const getTemplateById = async (req, res, next) => {
  try {
    const template = await SalaryTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (err) {
    next(err);
  }
};

// POST /api/templates
const createTemplate = async (req, res, next) => {
  try {
    const { templateKey, templateName, description, requiredFields, earningsSchema, deductionSchema } = req.body;

    const existing = await SalaryTemplate.findOne({ templateKey });
    if (existing) {
      return res.status(400).json({ message: "A template with this unique key already exists" });
    }

    const template = new SalaryTemplate({
      templateKey,
      templateName,
      description,
      requiredFields: requiredFields || [],
      earningsSchema: earningsSchema || [],
      deductionSchema: deductionSchema || [],
    });

    const saved = await template.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// PUT /api/templates/:id
const updateTemplate = async (req, res, next) => {
  try {
    const updated = await SalaryTemplate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Template not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/templates/:id
const deleteTemplate = async (req, res, next) => {
  try {
    const deleted = await SalaryTemplate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Template not found" });
    res.json({ message: "Template deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
