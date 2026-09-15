// pdfGenerator.js
// Builds a simple one-page A4 payslip PDF using pdfkit.
// Kept intentionally simple (basic tables drawn with rectangles/text) rather
// than pulling in a templating engine - good enough for a college project.
// Builds a professional one-page A4 payslip PDF using pdfkit.
// Supports company logos (both remote URLs like 3rd-party services and local /uploads files),
// formatted line item tables, financial totals, custom notes, and signatory blocks.

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePayslipPDF(payslip, res) {
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

async function fetchLogoBuffer(logoUrl) {
  if (!logoUrl || typeof logoUrl !== "string") return null;

  try {
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(logoUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Local file under backend
    const cleanPath = logoUrl.startsWith("/") ? logoUrl.slice(1) : logoUrl;
    const localPath = path.join(__dirname, "..", cleanPath);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch (err) {
    console.warn("Could not load logo for PDF:", err.message);
  }
  return null;
}

async function generatePayslipPDF(payslip, res) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // stream straight to the response so the browser can download it
  const s = payslip.snapshotData || {};
  const monthName = MONTH_NAMES[payslip.month - 1] || payslip.month;

  // Stream straight to response
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payslip.snapshotData.employeeCode}-${payslip.month}-${payslip.year}.pdf`
    `attachment; filename=payslip-${s.employeeCode || "emp"}-${payslip.month}-${payslip.year}.pdf`
  );
  doc.pipe(res);

  const s = payslip.snapshotData;
  // Attempt to fetch logo
  const logoBuffer = await fetchLogoBuffer(s.companyLogoUrl);

  // ---- Header ----
  doc.fontSize(18).text(s.companyName || "Company Name", { align: "center" });
  doc.fontSize(9).text(s.companyAddress || "", { align: "center" });
  let headerStartY = 40;
  const contentWidth = 515; // 595.28 - 2 * 40
  const leftX = 40;
  const rightX = 40 + contentWidth;

  // ---- Header Section ----
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, leftX, headerStartY, { fit: [65, 55] });
    } catch (e) {
      console.warn("Error rendering logo in PDF:", e.message);
    }
    // Company details next to logo
    doc.fontSize(16).font("Helvetica-Bold").text(s.companyName || "Company Name", leftX + 80, headerStartY);
    doc.fontSize(8).font("Helvetica");
    if (s.companyAddress) doc.text(s.companyAddress, leftX + 80, doc.y + 2);
    const taxInfo = [];
    if (s.companyGstin) taxInfo.push(`GSTIN: ${s.companyGstin}`);
    if (s.companyPan) taxInfo.push(`PAN: ${s.companyPan}`);
    if (taxInfo.length > 0) doc.text(taxInfo.join("   |   "), leftX + 80, doc.y + 2);
    if (s.companyEmail) doc.text(`Email: ${s.companyEmail}`, leftX + 80, doc.y + 2);
  } else {
    // Centered header if no logo
    doc.fontSize(18).font("Helvetica-Bold").text(s.companyName || "Company Name", { align: "center" });
    doc.fontSize(9).font("Helvetica");
    if (s.companyAddress) doc.text(s.companyAddress, { align: "center" });
    const taxInfo = [];
    if (s.companyGstin) taxInfo.push(`GSTIN: ${s.companyGstin}`);
    if (s.companyPan) taxInfo.push(`PAN: ${s.companyPan}`);
    if (taxInfo.length > 0) doc.text(taxInfo.join("   |   "), { align: "center" });
    if (s.companyEmail) doc.text(`Email: ${s.companyEmail}`, { align: "center" });
  }

  // Ensure header has space
  doc.y = Math.max(doc.y, headerStartY + 60);
  doc.moveDown(0.5);
  doc.fontSize(9).text(`GSTIN: ${s.companyGstin || "-"}   PAN: ${s.companyPan || "-"}`, {
    align: "center",
  });
  doc.moveDown();

  // Decorative Divider
  const headerDividerY = doc.y;
  doc.strokeColor("#4f46e5").lineWidth(2).moveTo(leftX, headerDividerY).lineTo(rightX, headerDividerY).stroke();
  doc.strokeColor("#000000").lineWidth(1); // Reset

  // Payslip Title Banner
  doc.moveDown(0.5);
  const bannerY = doc.y;
  doc.rect(leftX, bannerY, contentWidth, 24).fill("#f1f5f9");
  doc
    .fontSize(14)
    .text(`Payslip for ${payslip.month}/${payslip.year}`, { align: "center", underline: true });
  doc.moveDown();
    .fillColor("#0f172a")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(`PAYSLIP FOR ${String(monthName).toUpperCase()} ${payslip.year}`, leftX, bannerY + 6, {
      width: contentWidth,
      align: "center",
    });
  doc.fillColor("#000000"); // Reset
  doc.y = bannerY + 32;

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
  // ---- Employee & Attendance Information Box ----
  const empBoxY = doc.y;
  const colHalf = contentWidth / 2;

  // ---- Earnings / Deductions table (two columns) ----
  const startY = doc.y;
  const colWidth = 250;
  doc.rect(leftX, empBoxY, contentWidth, 76).strokeColor("#cbd5e1").stroke();

  doc.fontSize(11).text("Earnings", 40, startY, { underline: true });
  doc.text("Deductions", 40 + colWidth + 20, startY, { underline: true });
  doc.fontSize(8.5).font("Helvetica");

  let y = startY + 20;
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length);
  // Left Column (Employee Details)
  let currY = empBoxY + 8;
  doc.font("Helvetica-Bold").text("Employee Name:", leftX + 8, currY);
  doc.font("Helvetica").text(s.employeeName || "-", leftX + 90, currY);

  doc.fontSize(10);
  currY += 16;
  doc.font("Helvetica-Bold").text("Employee Code:", leftX + 8, currY);
  doc.font("Helvetica").text(s.employeeCode || "-", leftX + 90, currY);

  currY += 16;
  doc.font("Helvetica-Bold").text("Designation:", leftX + 8, currY);
  doc.font("Helvetica").text(s.designation || "-", leftX + 90, currY);

  currY += 16;
  doc.font("Helvetica-Bold").text("Department:", leftX + 8, currY);
  doc.font("Helvetica").text(s.department || "-", leftX + 90, currY);

  // Right Column (Bank & Attendance Details)
  currY = empBoxY + 8;
  const rightColX = leftX + colHalf + 8;
  doc.font("Helvetica-Bold").text("Bank A/C No:", rightColX, currY);
  doc.font("Helvetica").text(s.bankAccount || "-", rightColX + 80, currY);

  currY += 16;
  doc.font("Helvetica-Bold").text("IFSC Code:", rightColX, currY);
  doc.font("Helvetica").text(s.ifsc || "-", rightColX + 80, currY);

  currY += 16;
  doc.font("Helvetica-Bold").text("Working Days:", rightColX, currY);
  doc.font("Helvetica").text(String(payslip.workingDays ?? 30), rightColX + 80, currY);

  currY += 16;
  doc.font("Helvetica-Bold").text("Paid / LOP Days:", rightColX, currY);
  doc.font("Helvetica").text(`${payslip.paidDays ?? 30} / ${payslip.lopDays ?? 0}`, rightColX + 80, currY);

  doc.y = empBoxY + 86;

  // ---- Line Items Table ----
  const tableY = doc.y;
  const halfTableWidth = contentWidth / 2;

  // Table Headers
  doc.rect(leftX, tableY, halfTableWidth, 20).fill("#f8fafc").strokeColor("#cbd5e1").stroke();
  doc.rect(leftX + halfTableWidth, tableY, halfTableWidth, 20).fill("#f8fafc").strokeColor("#cbd5e1").stroke();

  doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(9);
  doc.text("EARNINGS", leftX + 8, tableY + 6);
  doc.text("AMOUNT (INR)", leftX + halfTableWidth - 95, tableY + 6, { width: 85, align: "right" });

  doc.text("DEDUCTIONS", leftX + halfTableWidth + 8, tableY + 6);
  doc.text("AMOUNT (INR)", rightX - 95, tableY + 6, { width: 85, align: "right" });
  doc.fillColor("#000000");

  let rowY = tableY + 20;
  const maxRows = Math.max(payslip.earnings?.length || 0, payslip.deductions?.length || 0, 1);
  const rowHeight = 18;

  doc.font("Helvetica").fontSize(8.5);

  for (let i = 0; i < maxRows; i++) {
    const earn = payslip.earnings[i];
    const ded = payslip.deductions[i];
    const earn = payslip.earnings && payslip.earnings[i];
    const ded = payslip.deductions && payslip.deductions[i];

    // Background zebra striping
    if (i % 2 === 1) {
      doc.rect(leftX, rowY, contentWidth, rowHeight).fill("#fbfcfe");
      doc.fillColor("#000000");
    }

    if (earn) {
      doc.text(earn.label, 40, y);
      doc.text(earn.amount.toFixed(2), 40 + colWidth - 60, y);
      doc.text(earn.label, leftX + 8, rowY + 5);
      doc.text(Number(earn.amount || 0).toFixed(2), leftX + halfTableWidth - 95, rowY + 5, {
        width: 85,
        align: "right",
      });
    }

    if (ded) {
      doc.text(ded.label, 40 + colWidth + 20, y);
      doc.text(ded.amount.toFixed(2), 40 + colWidth + 20 + colWidth - 60, y);
      doc.text(ded.label, leftX + halfTableWidth + 8, rowY + 5);
      doc.text(Number(ded.amount || 0).toFixed(2), rightX - 95, rowY + 5, {
        width: 85,
        align: "right",
      });
    }
    y += 18;

    rowY += rowHeight;
  }

  y += 10;
  doc.moveTo(40, y).lineTo(555, y).stroke();
  y += 10;
  // Border around line items
  doc.rect(leftX, tableY + 20, halfTableWidth, rowY - (tableY + 20)).strokeColor("#cbd5e1").stroke();
  doc.rect(leftX + halfTableWidth, tableY + 20, halfTableWidth, rowY - (tableY + 20)).strokeColor("#cbd5e1").stroke();

  doc.fontSize(10).text(`Gross Earnings: Rs. ${payslip.grossEarnings.toFixed(2)}`, 40, y);
  doc.text(`Total Deductions: Rs. ${payslip.totalDeductions.toFixed(2)}`, 40 + colWidth + 20, y);
  y += 25;
  // Subtotals Row
  doc.rect(leftX, rowY, halfTableWidth, 22).fill("#f1f5f9").strokeColor("#cbd5e1").stroke();
  doc.rect(leftX + halfTableWidth, rowY, halfTableWidth, 22).fill("#f1f5f9").strokeColor("#cbd5e1").stroke();

  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(8.5);
  doc.text("Total Gross Earnings:", leftX + 8, rowY + 6);
  doc.text(`Rs. ${Number(payslip.grossEarnings || 0).toFixed(2)}`, leftX + halfTableWidth - 95, rowY + 6, {
    width: 85,
    align: "right",
  });

  doc.text("Total Deductions:", leftX + halfTableWidth + 8, rowY + 6);
  doc.text(`Rs. ${Number(payslip.totalDeductions || 0).toFixed(2)}`, rightX - 95, rowY + 6, {
    width: 85,
    align: "right",
  });
  doc.fillColor("#000000");

  rowY += 28;

  // ---- Net Payable Salary Box ----
  doc.rect(leftX, rowY, contentWidth, 34).fill("#0f172a");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
  doc.text("NET SALARY PAYABLE:", leftX + 12, rowY + 11);
  doc
    .fontSize(13)
    .text(`Net Payable Salary: Rs. ${payslip.netSalary.toFixed(2)}`, 40, y, { underline: true });
  y += 20;
  doc.fontSize(10).text(`In Words: ${payslip.netSalaryInWords}`, 40, y);
    .fillColor("#34d399")
    .fontSize(12)
    .text(`Rs. ${Number(payslip.netSalary || 0).toFixed(2)}`, rightX - 160, rowY + 11, {
      width: 150,
      align: "right",
    });

  rowY += 40;

  // Net Salary in Words
  doc.fillColor("#334155").font("Helvetica-Oblique").fontSize(8.5);
  doc.text(`Amount in Words: ${payslip.netSalaryInWords || "Zero Rupees Only"}`, leftX, rowY);
  doc.font("Helvetica").fillColor("#000000");

  rowY += 20;

  // ---- Remarks / Notes ----
  if (s.notes) {
    doc.fontSize(8).font("Helvetica-Bold").text("Remarks / Notes:", leftX, rowY);
    doc.fontSize(8).font("Helvetica").text(s.notes, leftX, rowY + 11, { width: 340 });
  }

  // ---- Signatory Box ----
  const signY = rowY;
  const signX = rightX - 160;
  doc.fontSize(8.5).font("Helvetica-Bold").text(s.companyName || "Company", signX, signY, { width: 160, align: "center" });
  doc.moveDown(3);
  doc.fontSize(8).text("This is a system generated payslip and does not require a signature.", {
  doc.strokeColor("#94a3b8").moveTo(signX + 10, doc.y).lineTo(rightX - 10, doc.y).stroke();
  doc.fontSize(8).font("Helvetica").text(s.signatoryTitle || "Authorized Signatory", signX, doc.y + 4, {
    width: 160,
    align: "center",
  });

  // ---- Footer ----
  doc.fontSize(7.5).font("Helvetica").fillColor("#64748b").text(
    "This is a system-generated payslip generated via Payroll Management System and requires no physical signature.",
    leftX,
    doc.page.height - 35,
    { width: contentWidth, align: "center" }
  );

  doc.end();
}

module.exports = generatePayslipPDF;
