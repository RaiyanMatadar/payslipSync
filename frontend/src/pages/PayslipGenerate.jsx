// frontend/src/pages/PayslipGenerate.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import EditablePayslipCanvas from "../components/EditablePayslipCanvas";
import {
  ReceiptText,
  Calendar,
  Building2,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayslipGenerate() {
  const { id } = useParams(); // If present, editing existing slip
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState("single"); // "single" | "bulk"

  // Data collections
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(searchParams.get("companyId") || "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(searchParams.get("employeeId") || "");

  // Date selection
  const now = new Date();
  const [singleMonth, setSingleMonth] = useState(now.getMonth() + 1);
  const [singleYear, setSingleYear] = useState(now.getFullYear());

  // Bulk date range
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(6);
  const [endYear, setEndYear] = useState(now.getFullYear());

  // Active payslip data for the WYSIWYG canvas
  const [canvasData, setCanvasData] = useState(null);
  const [isExisting, setIsExisting] = useState(false);
  const [currentPayslipId, setCurrentPayslipId] = useState(id || null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // 1. Initial load: if id is passed, load that specific payslip
  useEffect(() => {
    const init = async () => {
      try {
        const compRes = await API.get("/companies");
        setCompanies(compRes.data || []);

        if (id) {
          // Edit existing slip mode
          setIsExisting(true);
          setCurrentPayslipId(id);
          const slipRes = await API.get(`/payslips/${id}`);
          const slip = slipRes.data;
          setCanvasData(slip);
          setSelectedCompanyId(slip.companyId?._id || slip.companyId);
          setSelectedEmployeeId(slip.employeeId?._id || slip.employeeId);
        } else {
          // Initial employee list if company is preselected
          const empRes = await API.get(
            selectedCompanyId ? `/employees?companyId=${selectedCompanyId}` : "/employees"
          );
          setEmployees(empRes.data || []);
          if (searchParams.get("employeeId")) {
            setSelectedEmployeeId(searchParams.get("employeeId"));
          } else if (empRes.data?.length > 0) {
            setSelectedEmployeeId(empRes.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  // 2. Fetch employees when selectedCompanyId changes (in create mode)
  useEffect(() => {
    if (id || !selectedCompanyId) return;

    const loadEmployees = async () => {
      try {
        const empRes = await API.get(`/employees?companyId=${selectedCompanyId}`);
        setEmployees(empRes.data || []);
        if (empRes.data?.length > 0) {
          setSelectedEmployeeId(empRes.data[0]._id);
        } else {
          setSelectedEmployeeId("");
          setCanvasData(null);
        }
      } catch (err) {
        console.error("Failed to load employees for company:", err);
      }
    };

    loadEmployees();
  }, [selectedCompanyId]);

  // 3. Build canvas data when employee or single month/year changes
  useEffect(() => {
    if (id) return; // In edit mode, canvas data is already loaded from slip
    if (!selectedEmployeeId) {
      setCanvasData(null);
      return;
    }

    const employee = employees.find((e) => e._id === selectedEmployeeId);
    if (!employee) return;

    const company =
      companies.find((c) => c._id === (employee.companyId?._id || employee.companyId)) ||
      companies.find((c) => c._id === selectedCompanyId);

    if (!company) return;

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

    const customFieldsObj =
      employee.customFields instanceof Map
        ? Object.fromEntries(employee.customFields)
        : employee.customFields || {};

    const previewData = {
      month: singleMonth,
      year: singleYear,
      workingDays: 30,
      paidDays: 30,
      lopDays: 0,
      earnings,
      deductions,
      snapshotData: {
        companyName: company.name || "",
        companyAddress: company.address || "",
        companyLogoUrl: company.logoUrl || "",
        companyGstin: company.gstin || "",
        companyPan: company.pan || "",
        companyEmail: company.email || "",
        companyContactNumber: company.contactNumber || "",
        employeeName: employee.fullName || "",
        employeeCode: employee.employeeCode || "",
        designation: employee.designation || "",
        department: employee.department || "",
        bankAccount: employee.bankAccount || "",
        ifsc: employee.ifsc || "",
        notes: "This is a computer-generated payslip and does not require a physical signature.",
        signatoryTitle: "Authorized Signatory",
        customFields: customFieldsObj,
      },
    };

    setCanvasData(previewData);
  }, [selectedEmployeeId, singleMonth, singleYear, employees, companies]);

  // Handle saving the canvas payslip (single mode)
  const handleSavePayslip = async (payload) => {
    setIsSaving(true);
    setFeedback(null);

    try {
      if (isExisting && currentPayslipId) {
        // Update existing payslip
        const res = await API.put(`/payslips/${currentPayslipId}`, payload);
        setFeedback({ type: "success", message: "Payslip snapshot updated successfully!" });
        setCanvasData(res.data);
      } else {
        // Create new single payslip
        const res = await API.post("/payslips", {
          ...payload,
          employeeId: selectedEmployeeId,
        });
        setCurrentPayslipId(res.data._id);
        setIsExisting(true);
        setFeedback({
          type: "success",
          message: "Payslip snapshot saved! You can now download the PDFKit export or print directly.",
        });
        setCanvasData(res.data);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to save payslip",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle bulk creation
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      alert("Please select an employee first");
      return;
    }

    setIsSaving(true);
    setBulkResult(null);
    setFeedback(null);

    try {
      const res = await API.post("/payslips/bulk", {
        employeeId: selectedEmployeeId,
        startMonth: Number(startMonth),
        startYear: Number(startYear),
        endMonth: Number(endMonth),
        endYear: Number(endYear),
      });

      setBulkResult(res.data);
      setFeedback({
        type: "success",
        message: `Bulk generation complete: ${res.data.createdCount} slips generated!`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to generate bulk payslips",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-indigo-600" />
            {isExisting ? "Edit Saved Salary Slip" : "Generate Salary Slip"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isExisting
              ? "Modifying historical snapshot for this specific slip."
              : "Generate one month or bulk range with live editable preview."}
          </p>
        </div>

        {/* Mode Toggle Pills (only if creating fresh) */}
        {!isExisting && (
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "single"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Single Month
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "bulk"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bulk Date Range
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`no-print p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Selection Control Panel (no-print) */}
      {!isExisting && (
        <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Company Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Company</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 font-medium"
              >
                <option value="">-- Choose Company --</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={employees.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 font-medium disabled:opacity-50"
              >
                <option value="">-- Choose Employee --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Single Month / Year Selectors */}
            {mode === "single" ? (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month</label>
                  <select
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    {MONTH_NAMES.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={singleYear}
                    onChange={(e) => setSingleYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  />
                </div>
              </>
            ) : (
              /* Bulk Range Selectors */
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Month & Year
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={startMonth}
                      onChange={(e) => setStartMonth(Number(e.target.value))}
                      className="w-2/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Month & Year</label>
                  <div className="flex gap-1.5">
                    <select
                      value={endMonth}
                      onChange={(e) => setEndMonth(Number(e.target.value))}
                      className="w-2/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {MONTH_NAMES.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={endYear}
                      onChange={(e) => setEndYear(Number(e.target.value))}
                      className="w-1/3 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bulk Generation Button */}
          {mode === "bulk" && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Bulk mode creates one payslip per month using the employee's baseline salary.
              </p>
              <button
                type="button"
                onClick={handleBulkGenerate}
                disabled={isSaving || !selectedEmployeeId}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                {isSaving ? "Generating Bulk Slips..." : "Generate Bulk Slips"}
              </button>
            </div>
          )}

          {/* Bulk Generation Results */}
          {bulkResult && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Generated {bulkResult.createdCount} Slips (Skipped {bulkResult.skippedCount} duplicates)
              </h4>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/payslips")}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Go to Payslip History &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Interactive WYSIWYG A4 Document Canvas */}
      {mode === "single" && (
        <>
          {canvasData ? (
            <EditablePayslipCanvas
              initialData={canvasData}
              onSave={handleSavePayslip}
              isExisting={isExisting}
              payslipId={currentPayslipId}
              isSaving={isSaving}
            />
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Select an employee to begin preview</p>
              <p className="text-xs text-slate-400 mt-1">
                The live editable A4 payslip canvas will render instantly.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
