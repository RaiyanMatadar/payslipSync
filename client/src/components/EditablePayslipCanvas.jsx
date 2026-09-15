// frontend/src/components/EditablePayslipCanvas.jsx
import React, { useState, useEffect } from "react";
import { calculateTotals } from "../utils/salaryCalculator";
import LineItemEditor from "./LineItemEditor";
import {
  Printer,
  Download,
  Save,
  CheckCircle,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EditablePayslipCanvas({
  initialData,
  onSave,
  isExisting = false,
  payslipId = null,
  isSaving = false,
}) {
  // Document state
  const snapshot = initialData?.snapshotData || {};
  const [companyName, setCompanyName] = useState(snapshot.companyName || "");
  const [companyAddress, setCompanyAddress] = useState(snapshot.companyAddress || "");
  const [companyGstin, setCompanyGstin] = useState(snapshot.companyGstin || "");
  const [companyPan, setCompanyPan] = useState(snapshot.companyPan || "");
  const [companyEmail, setCompanyEmail] = useState(snapshot.companyEmail || "");
  const [companyLogoUrl, setCompanyLogoUrl] = useState(snapshot.companyLogoUrl || "");

  const [employeeName, setEmployeeName] = useState(snapshot.employeeName || "");
  const [employeeCode, setEmployeeCode] = useState(snapshot.employeeCode || "");
  const [designation, setDesignation] = useState(snapshot.designation || "");
  const [department, setDepartment] = useState(snapshot.department || "");
  const [bankAccount, setBankAccount] = useState(snapshot.bankAccount || "");
  const [ifsc, setIfsc] = useState(snapshot.ifsc || "");
  const [customFields, setCustomFields] = useState(snapshot.customFields || {});

  const [month, setMonth] = useState(initialData?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());

  const [workingDays, setWorkingDays] = useState(initialData?.workingDays ?? 30);
  const [paidDays, setPaidDays] = useState(initialData?.paidDays ?? 30);
  const [lopDays, setLopDays] = useState(initialData?.lopDays ?? 0);

  const [earnings, setEarnings] = useState(initialData?.earnings || []);
  const [deductions, setDeductions] = useState(initialData?.deductions || []);

  const [notes, setNotes] = useState(
    snapshot.notes || "This is a computer-generated payslip and does not require a physical signature."
  );
  const [signatoryTitle, setSignatoryTitle] = useState(snapshot.signatoryTitle || "Authorized Signatory");

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      const s = initialData.snapshotData || {};
      setCompanyName(s.companyName || "");
      setCompanyAddress(s.companyAddress || "");
      setCompanyGstin(s.companyGstin || "");
      setCompanyPan(s.companyPan || "");
      setCompanyEmail(s.companyEmail || "");
      setCompanyLogoUrl(s.companyLogoUrl || "");

      setEmployeeName(s.employeeName || "");
      setEmployeeCode(s.employeeCode || "");
      setDesignation(s.designation || "");
      setDepartment(s.department || "");
      setBankAccount(s.bankAccount || "");
      setIfsc(s.ifsc || "");
      setCustomFields(s.customFields || {});

      if (initialData.month) setMonth(initialData.month);
      if (initialData.year) setYear(initialData.year);
      if (initialData.workingDays !== undefined) setWorkingDays(initialData.workingDays);
      if (initialData.paidDays !== undefined) setPaidDays(initialData.paidDays);
      if (initialData.lopDays !== undefined) setLopDays(initialData.lopDays);
      if (initialData.earnings) setEarnings(initialData.earnings);
      if (initialData.deductions) setDeductions(initialData.deductions);
      if (s.notes) setNotes(s.notes);
      if (s.signatoryTitle) setSignatoryTitle(s.signatoryTitle);
    }
  }, [initialData]);

  // Live calculation
  const totals = calculateTotals({ earnings, deductions });

  const handleSaveDocument = () => {
    const payload = {
      month: Number(month),
      year: Number(year),
      workingDays: Number(workingDays),
      paidDays: Number(paidDays),
      lopDays: Number(lopDays),
      earnings,
      deductions,
      snapshotData: {
        companyName,
        companyAddress,
        companyLogoUrl,
        companyGstin,
        companyPan,
        companyEmail,
        employeeName,
        employeeCode,
        designation,
        department,
        bankAccount,
        ifsc,
        notes,
        signatoryTitle,
        customFields,
      },
    };
    onSave(payload);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadServerPdf = () => {
    if (!payslipId) {
      alert("Please save this payslip first before downloading the server-generated PDFKit file.");
      return;
    }
    const token = localStorage.getItem("payroll_token");
    window.open(`/api/payslips/${payslipId}/pdf?token=${token}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Live Preview & Recalculations Active
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            A4 WYSIWYG Canvas
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            Print / Save Web PDF
          </button>

          {payslipId && (
            <button
              type="button"
              onClick={handleDownloadServerPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              PDFKit Export
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDocument}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-colors disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : isExisting ? "Update Payslip Snapshot" : "Save Payslip Snapshot"}
          </button>
        </div>
      </div>

      {/* Editor Line Item Panels (Quick Inline Editing) */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-4">
        <LineItemEditor
          title="Earnings Line Items"
          type="earning"
          items={earnings}
          onChange={setEarnings}
          suggestions={["Bonus", "Overtime", "Special Allowance", "Incentive"]}
        />
        <LineItemEditor
          title="Deductions Line Items"
          type="deduction"
          items={deductions}
          onChange={setDeductions}
          suggestions={["TDS", "Advance Salary", "Loan Recovery", "Penalty"]}
        />
      </div>

      {/* A4 Document Sheet */}
      <div className="payslip-sheet max-w-4xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-xl p-8 sm:p-12 text-slate-800 transition-all">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b-2 border-indigo-600">
          <div className="flex items-center gap-4">
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt={companyName}
                className="w-16 h-16 object-contain rounded-lg border border-slate-200 p-1 bg-white shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    companyName || "Co"
                  )}&background=4f46e5&color=fff&size=128`;
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black text-xl shrink-0">
                {companyName ? companyName[0] : "C"}
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {companyName || "Company Name"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
                {companyAddress || "Company Registered Address"}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1.5 font-medium">
                {companyGstin && <span>GSTIN: <b className="text-slate-700">{companyGstin}</b></span>}
                {companyPan && <span>PAN: <b className="text-slate-700">{companyPan}</b></span>}
                {companyEmail && <span>Email: {companyEmail}</span>}
              </div>
            </div>
          </div>

          <div className="text-right sm:self-center">
            <span className="inline-block px-3 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-wider">
              Payslip Document
            </span>
          </div>
        </div>

        {/* Payslip Title Banner */}
        <div className="my-5 bg-slate-100 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Salary Slip For:
            </span>
            <span className="text-sm font-extrabold text-indigo-700">
              {MONTH_NAMES[month - 1] || month} {year}
            </span>
          </div>

          {/* Inline Month / Year Controls for quick adjustments */}
          <div className="no-print flex items-center gap-2 text-xs">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
            >
              {MONTH_NAMES.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-center"
            />
          </div>
        </div>

        {/* Employee & Attendance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-700">
          {/* Left: Employee Info */}
          <div className="space-y-1.5">
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Employee Name:</span>
              <span className="font-bold text-slate-900">{employeeName || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Employee Code:</span>
              <span className="font-mono font-semibold text-slate-800">{employeeCode || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="font-semibold text-slate-800">{designation || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="font-semibold text-slate-800">{department || "-"}</span>
            </div>
          </div>

          {/* Right: Bank & Attendance */}
          <div className="space-y-1.5">
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Bank A/C No:</span>
              <span className="font-mono font-semibold text-slate-800">{bankAccount || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">IFSC Code:</span>
              <span className="font-mono font-semibold text-slate-800">{ifsc || "-"}</span>
            </div>

            {/* Attendance Days (Inline editable) */}
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Working Days:</span>
              <input
                type="number"
                min="0"
                max="31"
                value={workingDays}
                onChange={(e) => setWorkingDays(e.target.value)}
                className="w-16 px-1.5 py-0.5 text-right font-semibold bg-white border border-slate-200 rounded focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1">
              <span className="text-slate-500 font-medium">Paid / LOP Days:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={paidDays}
                  onChange={(e) => setPaidDays(e.target.value)}
                  className="w-12 px-1 py-0.5 text-right font-semibold bg-white border border-slate-200 rounded focus:border-indigo-500"
                />
                <span>/</span>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={lopDays}
                  onChange={(e) => setLopDays(e.target.value)}
                  className="w-12 px-1 py-0.5 text-right font-semibold bg-white border border-slate-200 rounded focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Template-Driven Custom Fields (e.g. PAN, UAN, PF No) */}
            {Object.entries(customFields).map(([key, val]) => (
              <div key={key} className="flex justify-between border-b border-slate-200/70 pb-1">
                <span className="text-slate-500 font-medium uppercase text-[10px]">
                  {key}:
                </span>
                <span className="font-mono font-semibold text-slate-800">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Earnings & Deductions Table */}
        <div className="mt-6 border border-slate-300 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                <th className="py-2.5 px-4 text-left font-bold w-1/4">EARNINGS</th>
                <th className="py-2.5 px-4 text-right font-bold w-1/4 border-r border-slate-300">AMOUNT (INR)</th>
                <th className="py-2.5 px-4 text-left font-bold w-1/4">DEDUCTIONS</th>
                <th className="py-2.5 px-4 text-right font-bold w-1/4">AMOUNT (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Array.from({
                length: Math.max(earnings.length, deductions.length, 1),
              }).map((_, idx) => {
                const earn = earnings[idx];
                const ded = deductions[idx];
                return (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                    {/* Earning Label */}
                    <td className="py-2 px-4 text-slate-800 font-medium">
                      {earn ? earn.label : ""}
                    </td>
                    {/* Earning Amount */}
                    <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900 border-r border-slate-300">
                      {earn ? Number(earn.amount || 0).toFixed(2) : ""}
                    </td>
                    {/* Deduction Label */}
                    <td className="py-2 px-4 text-slate-800 font-medium">
                      {ded ? ded.label : ""}
                    </td>
                    {/* Deduction Amount */}
                    <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900">
                      {ded ? Number(ded.amount || 0).toFixed(2) : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Subtotals */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-2.5 px-4">Total Gross Earnings:</td>
                <td className="py-2.5 px-4 text-right font-mono text-emerald-700 border-r border-slate-300">
                  Rs. {totals.grossEarnings.toFixed(2)}
                </td>
                <td className="py-2.5 px-4">Total Deductions:</td>
                <td className="py-2.5 px-4 text-right font-mono text-rose-700">
                  Rs. {totals.totalDeductions.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Net Salary Payable Banner */}
        <div className="mt-6 bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-slate-900/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Payable Salary
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400 font-mono">
              ₹ {totals.netSalary.toFixed(2)}
            </span>
          </div>

          <div className="text-right max-w-sm sm:max-w-md">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount in Words</span>
            <span className="text-xs sm:text-sm font-semibold italic text-slate-200">
              {totals.netSalaryInWords}
            </span>
          </div>
        </div>

        {/* Remarks & Signatory */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-8 text-xs">
          {/* Notes */}
          <div className="flex-1 space-y-1">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
              Remarks / Notes:
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* Signatory */}
          <div className="sm:w-56 text-center space-y-1 shrink-0 self-end sm:self-auto">
            <div className="h-12 flex items-end justify-center font-serif text-slate-400 italic text-sm">
              {companyName}
            </div>
            <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
              <input
                type="text"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full text-center font-bold bg-transparent text-xs text-slate-800 focus:outline-none focus:border-b focus:border-indigo-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">Employer Authorized Signatory</p>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          This is a computer-generated salary slip generated via Multi-Company Payroll Management System.
        </div>
      </div>
    </div>
  );
}
