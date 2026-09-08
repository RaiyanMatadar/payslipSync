// employeeController.js
const Employee = require("../models/Employee");
const Company = require("../models/Company");

// GET /api/employees?companyId=xxx
const getEmployees = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.companyId) filter.companyId = req.query.companyId;

    const employees = await Employee.find(filter).populate("companyId");
    res.json(employees);
  } catch (err) {
    next(err);
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("companyId");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// POST /api/employees
// We double check the company's template so only the fields the template
// actually asks for get saved into customFields (keeps data clean).
const createEmployee = async (req, res, next) => {
  try {
    const company = await Company.findById(req.body.companyId).populate("templateId");
    console.log(company);
    
    if (!company) return res.status(404).json({ message: "Company not found" });

    const allowedFields = company.templateId.requiredFields || [];
    const submittedCustomFields = req.body.customFields || {};

    const filteredCustomFields = {};
    allowedFields.forEach((field) => {
      if (submittedCustomFields[field] !== undefined) {
        filteredCustomFields[field] = submittedCustomFields[field];
      }
    });

    const employee = new Employee({
      ...req.body,
      customFields: filteredCustomFields,
    });

    const saved = await employee.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res, next) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
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
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
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
