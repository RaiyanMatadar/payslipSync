// companyController.js
const Company = require("../models/Company");

// GET /api/companies
const getCompanies = async (req, res, next) => {
  try {
    // populate templateId so the frontend gets the required fields list too
    const companies = await Company.find().populate("templateId");
    res.json(companies);
  } catch (err) {
    next(err);
  }
};

// GET /api/companies/:id
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate("templateId");
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    next(err);
  }
};

// POST /api/companies
const createCompany = async (req, res, next) => {
  try {
    const companyData = { ...req.body };

    // if a logo was uploaded via multer, req.file will exist
    if (req.file) {
      companyData.logoUrl = `/uploads/${req.file.filename}`;
    }

    const company = new Company(companyData);
    const saved = await company.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// PUT /api/companies/:id
// NOTE: changing templateId here does NOT touch past payslips because those
// keep their own snapshotData - only future payslips/forms will use the new one
const updateCompany = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.logoUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("templateId");

    if (!updated) return res.status(404).json({ message: "Company not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/companies/:id
const deleteCompany = async (req, res, next) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
