// templateController.js
const SalaryTemplate = require("../models/SalaryTemplate");

// GET /api/templates
const getTemplates = async (req, res, next) => {
  try {
    const templates = await SalaryTemplate.find();
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
    const template = new SalaryTemplate(req.body);
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
    await SalaryTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: "Template deleted" });
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
