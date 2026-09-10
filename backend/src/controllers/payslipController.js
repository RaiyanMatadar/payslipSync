// backend/src/controllers/payslipController.js
const archiver = require("archiver");
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const Company = require("../models/Company");
const { calculatePayslipTotals, round2 } = require("../utils/salaryCalculator");
const { generatePayslipPDF, generatePayslipPDFBuffer } = require("../utils/pdfGenerator");

/**
 * Builds the default earnings, deductions, and snapshotData from an Employee & Company
 */
async function buildDefaultPayslipData(employee, company) {
  const earnings = [
    { label: "Basic Pay", amount: employee.baseSalary?.basic || 0 },
    { label: "HRA", amount: employee.baseSalary?.hra || 0 },
    { label: "Allowances", amount: employee.baseSalary?.allowances || 0 },
  ].filter((item) => item.amount > 0 || item.label === "Basic Pay");

  const deductions = [
    { label: "Provident Fund", amount: employee.baseSalary?.pf || 0 },
    { label: "Professional Tax", amount: employee.baseSalary?.professionalTax || 0 },
    { label: "TDS", amount: employee.baseSalary?.tds || 0 },
  ].filter((item) => item.amount > 0);

  // Convert customFields Map to a plain object
  const customFieldsObj =
    employee.customFields instanceof Map
      ? Object.fromEntries(employee.customFields)
      : employee.customFields || {};

  const snapshotData = {
    companyName: company.name,
    companyAddress: company.address,
    companyLogoUrl: company.logoUrl,
    companyGstin: company.gstin,
    companyPan: company.pan,
    companyEmail: company.email,
    companyContactNumber: company.contactNumber,
    employeeName: employee.fullName,
    employeeCode: employee.employeeCode,
    designation: employee.designation,
    department: employee.department,
    bankAccount: employee.bankAccount,
    ifsc: employee.ifsc,
    notes: "This is a computer-generated payslip and does not require a physical signature.",
    signatoryTitle: "Authorized Signatory",
    customFields: customFieldsObj,
  };

  return { earnings, deductions, snapshotData };
}

// POST /api/payslips/preview
// Live recalculation without saving to database
const previewPayslip = async (req, res, next) => {
  try {
    const { earnings = [], deductions = [] } = req.body;
    const totals = calculatePayslipTotals({ earnings, deductions });
    res.json(totals);
  } catch (err) {
    next(err);
  }
};

// POST /api/payslips
// Single payslip creation with permanent snapshot
const createPayslip = async (req, res, next) => {
  try {
    const {
      employeeId,
      month,
      year,
      workingDays = 30,
      paidDays = 30,
      lopDays = 0,
      earnings,
      deductions,
      snapshotData: customSnapshot,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const company = await Company.findById(employee.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const defaults = await buildDefaultPayslipData(employee, company);

    const finalEarnings = Array.isArray(earnings) && earnings.length > 0 ? earnings : defaults.earnings;
    const finalDeductions = Array.isArray(deductions) ? deductions : defaults.deductions;

    const totals = calculatePayslipTotals({ earnings: finalEarnings, deductions: finalDeductions });

    const finalSnapshot = {
      ...defaults.snapshotData,
      ...(customSnapshot || {}),
    };

    const payslip = new Payslip({
      employeeId,
      companyId: company._id,
      month: Number(month),
      year: Number(year),
      workingDays: Number(workingDays),
      paidDays: Number(paidDays),
      lopDays: Number(lopDays),
      earnings: finalEarnings,
      deductions: finalDeductions,
      grossEarnings: totals.grossEarnings,
      totalDeductions: totals.totalDeductions,
      netSalary: totals.netSalary,
      netSalaryInWords: totals.netSalaryInWords,
      snapshotData: finalSnapshot,
    });

    const saved = await payslip.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "A payslip for this employee and month already exists" });
    }
    next(err);
  }
};

// POST /api/payslips/bulk
// Generates payslips over a date range
const createBulkPayslips = async (req, res, next) => {
  try {
    const { employeeId, startMonth, startYear, endMonth, endYear } = req.body;

    if (!employeeId || !startMonth || !startYear || !endMonth || !endYear) {
      return res.status(400).json({ message: "Please specify employeeId, startMonth, startYear, endMonth, endYear" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const company = await Company.findById(employee.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const defaults = await buildDefaultPayslipData(employee, company);
    const totals = calculatePayslipTotals({ earnings: defaults.earnings, deductions: defaults.deductions });

    const created = [];
    const skipped = [];

    let m = Number(startMonth);
    let y = Number(startYear);
    const stopM = Number(endMonth);
    const stopY = Number(endYear);

    while (y < stopY || (y === stopY && m <= stopM)) {
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
          grossEarnings: totals.grossEarnings,
          totalDeductions: totals.totalDeductions,
          netSalary: totals.netSalary,
          netSalaryInWords: totals.netSalaryInWords,
          snapshotData: defaults.snapshotData,
        });

        const saved = await payslip.save();
        created.push(saved);
      } catch (err) {
        skipped.push({ month: m, year: y, reason: "Already exists or error saving" });
      }

      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    res.status(201).json({
      success: true,
      createdCount: created.length,
      created,
      skippedCount: skipped.length,
      skipped,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips
const getPayslips = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.companyId) filter.companyId = req.query.companyId;
    if (req.query.year) filter.year = Number(req.query.year);
    if (req.query.month) filter.month = Number(req.query.month);

    const payslips = await Payslip.find(filter)
      .populate("employeeId")
      .populate("companyId")
      .sort({ year: -1, month: -1 });

    res.json(payslips);
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips/:id
const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate("employeeId")
      .populate("companyId");

    if (!payslip) return res.status(404).json({ message: "Payslip not found" });
    res.json(payslip);
  } catch (err) {
    next(err);
  }
};

// PUT /api/payslips/:id
// Re-editing an existing saved slip
const updatePayslip = async (req, res, next) => {
  try {
    const {
      earnings,
      deductions,
      workingDays,
      paidDays,
      lopDays,
      snapshotData: customSnapshot,
    } = req.body;

    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    if (Array.isArray(earnings)) payslip.earnings = earnings;
    if (Array.isArray(deductions)) payslip.deductions = deductions;
    if (workingDays !== undefined) payslip.workingDays = Number(workingDays);
    if (paidDays !== undefined) payslip.paidDays = Number(paidDays);
    if (lopDays !== undefined) payslip.lopDays = Number(lopDays);

    if (customSnapshot) {
      payslip.snapshotData = {
        ...(payslip.snapshotData ? (payslip.snapshotData.toObject ? payslip.snapshotData.toObject() : payslip.snapshotData) : {}),
        ...customSnapshot,
      };
    }

    const totals = calculatePayslipTotals({
      earnings: payslip.earnings,
      deductions: payslip.deductions,
    });

    payslip.grossEarnings = totals.grossEarnings;
    payslip.totalDeductions = totals.totalDeductions;
    payslip.netSalary = totals.netSalary;
    payslip.netSalaryInWords = totals.netSalaryInWords;

    const saved = await payslip.save();
    res.json(saved);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/payslips/:id
const deletePayslip = async (req, res, next) => {
  try {
    const deleted = await Payslip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Payslip not found" });
    res.json({ message: "Payslip deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips/:id/pdf
const downloadPayslipPDF = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    await generatePayslipPDF(payslip, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/payslips/export/zip
// Download multiple payslip PDFs packaged inside a single ZIP archive
const exportBulkPayslipsZip = async (req, res, next) => {
  try {
    const { ids, companyId, employeeId, year } = req.query;
    const filter = {};

    if (ids) {
      const idList = ids.split(",").map((id) => id.trim());
      filter._id = { $in: idList };
    } else {
      if (companyId) filter.companyId = companyId;
      if (employeeId) filter.employeeId = employeeId;
      if (year) filter.year = Number(year);
    }

    const payslips = await Payslip.find(filter).sort({ year: -1, month: -1 });

    if (payslips.length === 0) {
      return res.status(404).json({ message: "No payslips matched the export filter" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="payslips-bundle.zip"');

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    for (const slip of payslips) {
      try {
        const buffer = await generatePayslipPDFBuffer(slip);
        const code = slip.snapshotData?.employeeCode || slip.employeeId;
        const filename = `payslip-${code}-${slip.month}-${slip.year}.pdf`;
        archive.append(buffer, { name: filename });
      } catch (pdfErr) {
        console.warn(`Error generating PDF for slip ${slip._id}:`, pdfErr.message);
      }
    }

    await archive.finalize();
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
  exportBulkPayslipsZip,
};
