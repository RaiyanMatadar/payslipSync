// frontend/src/pages/PayslipHistory.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  History,
  Search,
  Download,
  FileArchive,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  ReceiptText,
  Filter,
  CheckSquare,
  Square,
  Printer,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayslipHistory() {
  const [payslips, setPayslips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlipIds, setSelectedSlipIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCompanyId) params.append("companyId", selectedCompanyId);
      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);

      const [slipRes, compRes] = await Promise.all([
        API.get(`/payslips?${params.toString()}`),
        companies.length === 0 ? API.get("/companies") : Promise.resolve({ data: companies }),
      ]);

      setPayslips(slipRes.data || []);
      if (companies.length === 0) setCompanies(compRes.data || []);
    } catch (err) {
      console.error("Failed to load payslip history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [selectedCompanyId, selectedYear, selectedMonth]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payslip record?")) return;
    try {
      await API.delete(`/payslips/${id}`);
      setPayslips(payslips.filter((p) => p._id !== id));
      setSelectedSlipIds(selectedSlipIds.filter((sid) => sid !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete payslip");
    }
  };

  // Toggle single selection
  const handleToggleSelect = (id) => {
    if (selectedSlipIds.includes(id)) {
      setSelectedSlipIds(selectedSlipIds.filter((sid) => sid !== id));
    } else {
      setSelectedSlipIds([...selectedSlipIds, id]);
    }
  };

  // Select all visible
  const handleSelectAll = () => {
    if (selectedSlipIds.length === filtered.length) {
      setSelectedSlipIds([]);
    } else {
      setSelectedSlipIds(filtered.map((p) => p._id));
    }
  };

  // Single PDF download link
  const getSinglePdfUrl = (slipId) => {
    const token = localStorage.getItem("payroll_token");
    return `/api/payslips/${slipId}/pdf?token=${token}`;
  };

  // Bulk ZIP download
  const handleDownloadZip = () => {
    const token = localStorage.getItem("payroll_token");
    let url = `/api/payslips/export/zip?token=${token}`;

    if (selectedSlipIds.length > 0) {
      url += `&ids=${selectedSlipIds.join(",")}`;
    } else {
      if (selectedCompanyId) url += `&companyId=${selectedCompanyId}`;
      if (selectedYear) url += `&year=${selectedYear}`;
      if (selectedMonth) url += `&month=${selectedMonth}`;
    }

    window.open(url, "_blank");
  };

  const filtered = payslips.filter((slip) => {
    const name = slip.snapshotData?.employeeName || slip.employeeId?.fullName || "";
    const code = slip.snapshotData?.employeeCode || slip.employeeId?.employeeCode || "";
    const compName = slip.snapshotData?.companyName || slip.companyId?.name || "";
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      compName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" /> Payslip History & Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse frozen salary snapshots, re-open in interactive editor, download PDFs or export ZIP archives.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
            title="Download ZIP of selected or filtered payslips"
          >
            <FileArchive className="w-4 h-4" />
            {selectedSlipIds.length > 0
              ? `Export Selected (${selectedSlipIds.length}) as ZIP`
              : "Export All Filtered as ZIP"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        {/* Company Filter */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Filter by Company</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Filter by Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Filter by Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="">All Months</option>
            {MONTH_NAMES.map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Search Employee / Code</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading payslip history...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No payslips matched your criteria</p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your filters or generate new payslips.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3 text-center w-10">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-slate-500 hover:text-indigo-600"
                      title="Select all"
                    >
                      {selectedSlipIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">Employee</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Period</th>
                  <th className="py-3 px-4 text-right">Gross Pay</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Salary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((slip) => {
                  const isSelected = selectedSlipIds.includes(slip._id);
                  const s = slip.snapshotData || {};
                  const empName = s.employeeName || slip.employeeId?.fullName || "Employee";
                  const empCode = s.employeeCode || slip.employeeId?.employeeCode || "-";
                  const compName = s.companyName || slip.companyId?.name || "Company";

                  return (
                    <tr
                      key={slip._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(slip._id)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{empName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{empCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">{compName}</span>
                        <span className="text-[10px] text-slate-400">{s.designation || "-"}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {MONTH_NAMES[slip.month - 1] || slip.month} {slip.year}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                        ₹ {Number(slip.grossEarnings || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-rose-600">
                        - ₹ {Number(slip.totalDeductions || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                        ₹ {Number(slip.netSalary || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <Link
                          to={`/payslips/${slip._id}/edit`}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                          title="Open in interactive document editor"
                        >
                          <Edit2 className="w-3 h-3" /> Edit / Preview
                        </Link>
                        <a
                          href={getSinglePdfUrl(slip._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                          title="Download high-resolution PDFKit document"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </a>
                        <button
                          onClick={() => handleDelete(slip._id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-block align-middle"
                          title="Delete payslip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
