// pdfGenerator.js
// Builds a simple one-page A4 payslip PDF using pdfkit.
// Kept intentionally simple (basic tables drawn with rectangles/text) rather
// than pulling in a templating engine - good enough for a college project.

const PDFDocument = require("pdfkit");

function generatePayslipPDF(payslip, res) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // stream straight to the response so the browser can download it
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payslip.snapshotData.employeeCode}-${payslip.month}-${payslip.year}.pdf`
  );
  doc.pipe(res);

  const s = payslip.snapshotData;

  // ---- Header ----
  doc.fontSize(18).text(s.companyName || "Company Name", { align: "center" });
  doc.fontSize(9).text(s.companyAddress || "", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`GSTIN: ${s.companyGstin || "-"}   PAN: ${s.companyPan || "-"}`, {
    align: "center",
  });
  doc.moveDown();
  doc
    .fontSize(14)
    .text(`Payslip for ${payslip.month}/${payslip.year}`, { align: "center", underline: true });
  doc.moveDown();

  // ---- Employee details ----
  doc.fontSize(10);
  doc.text(`Employee Name: ${s.employeeName}`);
  doc.text(`Employee Code: ${s.employeeCode}`);
  doc.text(`Designation: ${s.designation || "-"}`);
  doc.text(`Department: ${s.department || "-"}`);
  doc.text(`Bank Account: ${s.bankAccount || "-"}   IFSC: ${s.ifsc || "-"}`);
  doc.text(
    `Working Days: ${payslip.workingDays}   Paid Days: ${payslip.paidDays}   LOP Days: ${payslip.lopDays}`
  );
  doc.moveDown();

  // ---- Earnings / Deductions table (two columns) ----
  const startY = doc.y;
  const colWidth = 250;

  doc.fontSize(11).text("Earnings", 40, startY, { underline: true });
  doc.text("Deductions", 40 + colWidth + 20, startY, { underline: true });

  let y = startY + 20;
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length);

  doc.fontSize(10);
  for (let i = 0; i < maxRows; i++) {
    const earn = payslip.earnings[i];
    const ded = payslip.deductions[i];

    if (earn) {
      doc.text(earn.label, 40, y);
      doc.text(earn.amount.toFixed(2), 40 + colWidth - 60, y);
    }
    if (ded) {
      doc.text(ded.label, 40 + colWidth + 20, y);
      doc.text(ded.amount.toFixed(2), 40 + colWidth + 20 + colWidth - 60, y);
    }
    y += 18;
  }

  y += 10;
  doc.moveTo(40, y).lineTo(555, y).stroke();
  y += 10;

  doc.fontSize(10).text(`Gross Earnings: Rs. ${payslip.grossEarnings.toFixed(2)}`, 40, y);
  doc.text(`Total Deductions: Rs. ${payslip.totalDeductions.toFixed(2)}`, 40 + colWidth + 20, y);
  y += 25;

  doc
    .fontSize(13)
    .text(`Net Payable Salary: Rs. ${payslip.netSalary.toFixed(2)}`, 40, y, { underline: true });
  y += 20;
  doc.fontSize(10).text(`In Words: ${payslip.netSalaryInWords}`, 40, y);

  doc.moveDown(3);
  doc.fontSize(8).text("This is a system generated payslip and does not require a signature.", {
    align: "center",
  });

  doc.end();
}

module.exports = generatePayslipPDF;
