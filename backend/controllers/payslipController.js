// payslipController.js
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const Company = require("../models/Company");
const numberToWords = require("../utils/numberToWords");
const generatePayslipPDF = require("../utils/pdfGenerator");

// small helper - adds up a list of {label, amount} line items
function sumLineItems(items) {
  return items.reduce((total, item) => total + Number(item.amount || 0), 0);
}

// builds the snapshotData object + the default earnings/deductions
// from the employee's baseSalary. Used both for single + bulk generation.
async function buildDefaultPayslipData(employee, company) {
  const earnings = [
    { label: "Basic Pay", amount: employee.baseSalary.basic },
    { label: "HRA", amount: employee.baseSalary.hra },
    { label: "Allowances", amount: employee.baseSalary.allowances },
  ];

  const deductions = [
    { label: "Provident Fund", amount: employee.baseSalary.pf },
    { label: "Professional Tax", amount: employee.baseSalary.professionalTax },
    { label: "TDS", amount: employee.baseSalary.tds },
  ];

  const snapshotData = {
    companyName: company.name,
    companyAddress: company.address,
    companyLogoUrl: company.logoUrl,
    companyGstin: company.gstin,
    companyPan: company.pan,
    employeeName: employee.fullName,
    employeeCode: employee.employeeCode,
    designation: employee.designation,
    department: employee.department,
    bankAccount: employee.bankAccount,
    ifsc: employee.ifsc,
    customFields: Object.fromEntries(employee.customFields || []),
  };

  return { earnings, deductions, snapshotData };
}

// POST /api/payslips/preview
// Does NOT save anything - just recalculates totals so the frontend's
// interactive editing canvas can show live numbers as the user
// adds/edits/deletes line items.
const previewPayslip = async (req, res, next) => {
  try {
    const { earnings = [], deductions = [] } = req.body;

    const grossEarnings = sumLineItems(earnings);
    const totalDeductions = sumLineItems(deductions);
    const netSalary = grossEarnings - totalDeductions;

    res.json({
      grossEarnings,
      totalDeductions,
      netSalary,
      netSalaryInWords: numberToWords(netSalary),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payslips
// Single month generation. Accepts final earnings/deductions/workingDays etc
// (i.e. whatever the user ended up with after editing on the preview canvas).
const createPayslip = async (req, res, next) => {
  try {
    const { employeeId, month, year, workingDays, paidDays, lopDays, earnings, deductions } =
      req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const company = await Company.findById(employee.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const defaults = await buildDefaultPayslipData(employee, company);

    const finalEarnings = earnings && earnings.length ? earnings : defaults.earnings;
    const finalDeductions = deductions && deductions.length ? deductions : defaults.deductions;

    const grossEarnings = sumLineItems(finalEarnings);
    const totalDeductions = sumLineItems(finalDeductions);
    const netSalary = grossEarnings - totalDeductions;

    const payslip = new Payslip({
      employeeId,
      companyId: company._id,
      month,
      year,
      workingDays: workingDays || 30,
      paidDays: paidDays || 30,
      lopDays: lopDays || 0,
      earnings: finalEarnings,
      deductions: finalDeductions,
      grossEarnings,
      totalDeductions,
      netSalary,
      netSalaryInWords: numberToWords(netSalary),
      snapshotData: defaults.snapshotData,
    });

    const saved = await payslip.save();
    res.status(201).json(saved);
  } catch (err) {
    // duplicate month/year for the same employee hits the unique index
    if (err.code === 11000) {
      return res.status(400).json({ message: "Payslip for this month already exists" });
    }
    next(err);
  }
};

// POST /api/payslips/bulk
// Generates multiple consecutive months in one go using the employee's
// default baseSalary for every month (user can edit individual ones later).
const createBulkPayslips = async (req, res, next) => {
  try {
    const { employeeId, startMonth, startYear, endMonth, endYear } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const company = await Company.findById(employee.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const defaults = await buildDefaultPayslipData(employee, company);
    const grossEarnings = sumLineItems(defaults.earnings);
    const totalDeductions = sumLineItems(defaults.deductions);
    const netSalary = grossEarnings - totalDeductions;

    const created = [];
    const skipped = [];

    let m = startMonth;
    let y = startYear;

    // loop month by month from start to end (inclusive)
    while (y < endYear || (y === endYear && m <= endMonth)) {
      try {
        const payslip = new Payslip({
          employeeId,
          companyId: company._id,
          month: m,
          year: y,
          workingDays: 30,
          paidDays: 30,
          lopDays: 0,
          earnings: defaults.earnings,
          deductions: defaults.deductions,
          grossEarnings,
          totalDeductions,
          netSalary,
          netSalaryInWords: numberToWords(netSalary),
          snapshotData: defaults.snapshotData,
        });
        const saved = await payslip.save();
        created.push(saved);
      } catch (err) {
        // skip months that already have a payslip instead of failing everything
        skipped.push({ month: m, year: y, reason: "already exists" });
      }

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    res.status(201).json({ created, skipped });
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips?employeeId=xxx
const getPayslips = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.companyId) filter.companyId = req.query.companyId;

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });
    res.json(payslips);
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips/:id
const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });
    res.json(payslip);
  } catch (err) {
    next(err);
  }
};

// PUT /api/payslips/:id
// Lets the user go back and edit a saved payslip (e.g. fix a mistake)
// without touching the employee's master baseSalary record.
const updatePayslip = async (req, res, next) => {
  try {
    const { earnings, deductions, workingDays, paidDays, lopDays } = req.body;

    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    if (earnings) payslip.earnings = earnings;
    if (deductions) payslip.deductions = deductions;
    if (workingDays !== undefined) payslip.workingDays = workingDays;
    if (paidDays !== undefined) payslip.paidDays = paidDays;
    if (lopDays !== undefined) payslip.lopDays = lopDays;

    payslip.grossEarnings = sumLineItems(payslip.earnings);
    payslip.totalDeductions = sumLineItems(payslip.deductions);
    payslip.netSalary = payslip.grossEarnings - payslip.totalDeductions;
    payslip.netSalaryInWords = numberToWords(payslip.netSalary);

    const saved = await payslip.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/payslips/:id
const deletePayslip = async (req, res, next) => {
  try {
    await Payslip.findByIdAndDelete(req.params.id);
    res.json({ message: "Payslip deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips/:id/pdf
const downloadPayslipPDF = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    generatePayslipPDF(payslip, res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  previewPayslip,
  createPayslip,
  createBulkPayslips,
  getPayslips,
  getPayslipById,
  updatePayslip,
  deletePayslip,
  downloadPayslipPDF,
};
