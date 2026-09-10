// backend/src/controllers/employeeController.js
const Employee = require("../models/Employee");
const Company = require("../models/Company");

// GET /api/employees
const getEmployees = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.companyId) {
      filter.companyId = req.query.companyId;
    }

    const employees = await Employee.find(filter)
      .populate({
        path: "companyId",
        populate: { path: "templateId" },
      })
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate({
      path: "companyId",
      populate: { path: "templateId" },
    });

    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// POST /api/employees
const createEmployee = async (req, res, next) => {
  try {
    const { companyId, employeeCode, customFields } = req.body;

    const company = await Company.findById(companyId).populate("templateId");
    if (!company) return res.status(404).json({ message: "Selected company does not exist" });

    // Validate required fields mandated by the company's active template
    const template = company.templateId;
    const requiredFields = template?.requiredFields || [];
    const submittedCustom = customFields || {};

    const missingFields = [];
    requiredFields.forEach((fieldKey) => {
      // Check top-level properties or customFields
      const hasTopLevel = req.body[fieldKey] !== undefined && req.body[fieldKey] !== "";
      const hasCustom = submittedCustom[fieldKey] !== undefined && submittedCustom[fieldKey] !== "";
      if (!hasTopLevel && !hasCustom) {
        missingFields.push(fieldKey);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Template '${template.templateName}' requires the following fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // Check duplicate employeeCode in same company
    const duplicate = await Employee.findOne({ companyId, employeeCode });
    if (duplicate) {
      return res.status(400).json({ message: `Employee code '${employeeCode}' already exists in this company` });
    }

    const employee = new Employee(req.body);
    const saved = await employee.save();
    const populated = await Employee.findById(saved._id).populate({
      path: "companyId",
      populate: { path: "templateId" },
    });

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: "companyId",
      populate: { path: "templateId" },
    });

    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res, next) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
