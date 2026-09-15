// backend/src/utils/pdfGenerator.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Loads a logo as a Buffer from URL (http/https), data URI, or local path
 * @param {string} logoUrl
 * @returns {Promise<Buffer|null>}
 */
async function fetchLogoBuffer(logoUrl) {
  if (!logoUrl || typeof logoUrl !== "string") return null;

  try {
    // Data URI (e.g. data:image/png;base64,...)
    if (logoUrl.startsWith("data:image/")) {
      const base64Data = logoUrl.split(",")[1];
      if (base64Data) {
        return Buffer.from(base64Data, "base64");
      }
    }

    // Remote HTTP / HTTPS URL
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(logoUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Local file path
    const cleanPath = logoUrl.startsWith("/") ? logoUrl.slice(1) : logoUrl;
    const localPath = path.join(__dirname, "..", "..", cleanPath);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  } catch (err) {
    console.warn("Could not load logo for PDF:", err.message);
  }
  return null;
}

/**
 * Builds the PDF document structure on a given PDFKit doc instance
 */
async function buildPayslipDoc(doc, payslip) {
  const s = payslip.snapshotData || {};
  const monthName = MONTH_NAMES[payslip.month - 1] || payslip.month;
  const logoBuffer = await fetchLogoBuffer(s.companyLogoUrl);

  const leftX = 40;
  const contentWidth = 515; // 595.28 - 2 * 40
  const rightX = leftX + contentWidth;
  let headerStartY = 40;

  // ---- Header Section ----
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, leftX, headerStartY, { fit: [65, 55] });
    } catch (e) {
      console.warn("Error rendering logo image:", e.message);
    }
    doc.fontSize(16).font("Helvetica-Bold").text(s.companyName || "Company Name", leftX + 80, headerStartY);
    doc.fontSize(8.5).font("Helvetica");
    if (s.companyAddress) doc.text(s.companyAddress, leftX + 80, doc.y + 2);
    const taxInfo = [];
    if (s.companyGstin) taxInfo.push(`GSTIN: ${s.companyGstin}`);
    if (s.companyPan) taxInfo.push(`PAN: ${s.companyPan}`);
    if (taxInfo.length > 0) doc.text(taxInfo.join("   |   "), leftX + 80, doc.y + 2);
    if (s.companyEmail) doc.text(`Email: ${s.companyEmail}   Phone: ${s.companyContactNumber || "-"}`, leftX + 80, doc.y + 2);
  } else {
    doc.fontSize(17).font("Helvetica-Bold").text(s.companyName || "Company Name", { align: "center" });
    doc.fontSize(8.5).font("Helvetica");
    if (s.companyAddress) doc.text(s.companyAddress, { align: "center" });
    const taxInfo = [];
    if (s.companyGstin) taxInfo.push(`GSTIN: ${s.companyGstin}`);
    if (s.companyPan) taxInfo.push(`PAN: ${s.companyPan}`);
    if (taxInfo.length > 0) doc.text(taxInfo.join("   |   "), { align: "center" });
    if (s.companyEmail) doc.text(`Email: ${s.companyEmail}   Phone: ${s.companyContactNumber || "-"}`, { align: "center" });
  }

  // Ensure header has adequate space
  doc.y = Math.max(doc.y, headerStartY + 60);
  doc.moveDown(0.4);

  // Decorative Divider
  const headerDividerY = doc.y;
  doc.strokeColor("#4f46e5").lineWidth(2).moveTo(leftX, headerDividerY).lineTo(rightX, headerDividerY).stroke();
  doc.strokeColor("#000000").lineWidth(1);

  // Payslip Title Banner
  doc.moveDown(0.5);
  const bannerY = doc.y;
  doc.rect(leftX, bannerY, contentWidth, 24).fill("#f1f5f9");
  doc.fillColor("#0f172a")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(`PAYSLIP FOR ${String(monthName).toUpperCase()} ${payslip.year}`, leftX, bannerY + 6, {
      width: contentWidth,
      align: "center",
    });
  doc.fillColor("#000000");
  doc.y = bannerY + 30;

  // ---- Employee & Attendance Information Box ----
  const empBoxY = doc.y;
  const colHalf = contentWidth / 2;
  const empBoxHeight = 84;
  doc.rect(leftX, empBoxY, contentWidth, empBoxHeight).strokeColor("#cbd5e1").stroke();

  // Left Column (Employee Details)
  let currY = empBoxY + 8;
  doc.font("Helvetica-Bold").fontSize(8.5).text("Employee Name:", leftX + 8, currY);
  doc.font("Helvetica").text(s.employeeName || "-", leftX + 90, currY);

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

  doc.y = empBoxY + empBoxHeight + 10;

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
    const earn = payslip.earnings && payslip.earnings[i];
    const ded = payslip.deductions && payslip.deductions[i];

    // Background zebra striping
    if (i % 2 === 1) {
      doc.rect(leftX, rowY, contentWidth, rowHeight).fill("#fbfcfe");
      doc.fillColor("#000000");
    }

    if (earn) {
      doc.text(earn.label, leftX + 8, rowY + 4);
      doc.text(Number(earn.amount || 0).toFixed(2), leftX + halfTableWidth - 95, rowY + 4, {
        width: 85,
        align: "right",
      });
    }

    if (ded) {
      doc.text(ded.label, leftX + halfTableWidth + 8, rowY + 4);
      doc.text(Number(ded.amount || 0).toFixed(2), rightX - 95, rowY + 4, {
        width: 85,
        align: "right",
      });
    }

    rowY += rowHeight;
  }

  // Border around line items
  doc.rect(leftX, tableY + 20, halfTableWidth, rowY - (tableY + 20)).strokeColor("#cbd5e1").stroke();
  doc.rect(leftX + halfTableWidth, tableY + 20, halfTableWidth, rowY - (tableY + 20)).strokeColor("#cbd5e1").stroke();

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
  doc.rect(leftX, rowY, contentWidth, 32).fill("#0f172a");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10.5);
  doc.text("NET SALARY PAYABLE:", leftX + 12, rowY + 10);
  doc.fillColor("#34d399")
    .fontSize(11.5)
    .text(`Rs. ${Number(payslip.netSalary || 0).toFixed(2)}`, rightX - 160, rowY + 10, {
      width: 150,
      align: "right",
    });

  rowY += 38;

  // Net Salary in Words
  doc.fillColor("#334155").font("Helvetica-Oblique").fontSize(8.5);
  doc.text(`Amount in Words: ${payslip.netSalaryInWords || "Rupees Zero Only"}`, leftX, rowY);
  doc.font("Helvetica").fillColor("#000000");

  rowY += 18;

  // ---- Remarks / Notes ----
  if (s.notes) {
    doc.fontSize(8).font("Helvetica-Bold").text("Remarks / Notes:", leftX, rowY);
    doc.fontSize(7.5).font("Helvetica").text(s.notes, leftX, rowY + 11, { width: 340 });
  }

  // ---- Signatory Box ----
  const signY = rowY;
  const signX = rightX - 160;
  doc.fontSize(8.5).font("Helvetica-Bold").text(s.companyName || "Company", signX, signY, { width: 160, align: "center" });
  doc.strokeColor("#94a3b8").moveTo(signX + 15, signY + 38).lineTo(rightX - 15, signY + 38).stroke();
  doc.fontSize(8).font("Helvetica").text(s.signatoryTitle || "Authorized Signatory", signX, signY + 42, {
    width: 160,
    align: "center",
  });

  // ---- Footer ----
  doc.fontSize(7.5).font("Helvetica").fillColor("#64748b").text(
    "This is a system-generated payslip generated via Multi-Company Payroll System and requires no physical signature.",
    leftX,
    doc.page.height - 35,
    { width: contentWidth, align: "center" }
  );

  doc.end();
}

/**
 * Streams payslip PDF directly to Express response
 */
async function generatePayslipPDF(payslip, res) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const s = payslip.snapshotData || {};

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${s.employeeCode || "emp"}-${payslip.month}-${payslip.year}.pdf`
  );

  doc.pipe(res);
  await buildPayslipDoc(doc, payslip);
}

/**
 * Returns payslip PDF as a Buffer (used for bulk ZIP download)
 */
function generatePayslipPDFBuffer(payslip) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      await buildPayslipDoc(doc, payslip);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  generatePayslipPDF,
  generatePayslipPDFBuffer,
};
