// backend/src/controllers/companyController.js
const Company = require("../models/Company");
const { uploadBufferToCloudinary } = require("../config/cloudinary");

// GET /api/companies
const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate("templateId").sort({ createdAt: -1 });
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

    // If an image was uploaded via Multer, stream to Cloudinary
    if (req.file) {
      const cloudinaryUrl = await uploadBufferToCloudinary(
        req.file.buffer,
        "payroll_system/logos",
        req.file.mimetype
      );
      companyData.logoUrl = cloudinaryUrl;
    }

    const company = new Company(companyData);
    const saved = await company.save();
    const populated = await Company.findById(saved._id).populate("templateId");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/companies/:id
const updateCompany = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const cloudinaryUrl = await uploadBufferToCloudinary(
        req.file.buffer,
        "payroll_system/logos",
        req.file.mimetype
      );
      updateData.logoUrl = cloudinaryUrl;
    }

    const updated = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
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
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/companies/lookup-logo?query=google.com
const lookupLogo = async (req, res, next) => {
  try {
    let query = (req.query.query || "").trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ message: "Domain or company name required" });
    }

    // Clean up domain URL
    query = query.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    query = query.split("/")[0].split("?")[0];
    const domain = query.includes(".") ? query : `${query}.com`;

    const logoSources = [
      { name: "Unavatar", url: `https://unavatar.io/${domain}` },
      { name: "Google Favicon", url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128` },
      { name: "IconHorse", url: `https://icon.horse/icon/${domain}` },
    ];

    res.json({
      domain,
      logoUrl: logoSources[0].url,
      fallbackUrl: logoSources[1].url,
      sources: logoSources,
    });
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
  lookupLogo,
};
