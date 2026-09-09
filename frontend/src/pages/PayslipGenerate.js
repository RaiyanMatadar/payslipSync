import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LineItemEditor from "../components/LineItemEditor";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];


function PayslipGenerate() {
  const [searchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(searchParams.get("employeeId") || "");
  const [employee, setEmployee] = useState(null);

  const [mode, setMode] = useState("single"); // "single" or "bulk"

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  const [workingDays, setWorkingDays] = useState(30);
  const [paidDays, setPaidDays] = useState(30);
  const [lopDays, setLopDays] = useState(0);

  const [earnings, setEarnings] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [preview, setPreview] = useState({ grossEarnings: 0, totalDeductions: 0, netSalary: 0, netSalaryInWords: "" });

  const [bulkResult, setBulkResult] = useState(null);
  const [savedPayslipId, setSavedPayslipId] = useState(null);

  // load all companies + employees once, so the dropdown works regardless of
  // which company page the user came from
  useEffect(() => {
    api.get("/companies").then((res) => setCompanies(res.data));
  }, []);

  useEffect(() => {
    api.get("/employees").then((res) => setEmployees(res.data));
  }, []);

  // whenever the selected employee changes, load their baseline salary
  // into the earnings/deductions editor as a starting point
  useEffect(() => {
    if (!selectedEmployeeId) return;

    api.get(`/employees/${selectedEmployeeId}`).then((res) => {
      const emp = res.data;
      setEmployee(emp);

      setEarnings([
        { label: "Basic Pay", amount: emp.baseSalary.basic },
        { label: "HRA", amount: emp.baseSalary.hra },
        { label: "Allowances", amount: emp.baseSalary.allowances },
      ]);
      setDeductions([
        { label: "Provident Fund", amount: emp.baseSalary.pf },
        { label: "Professional Tax", amount: emp.baseSalary.professionalTax },
        { label: "TDS", amount: emp.baseSalary.tds },
      ]);
    });
  }, [selectedEmployeeId]);

  // recalculate the live preview (via backend so words-conversion stays consistent)
  // every time earnings or deductions change
  useEffect(() => {
    if (earnings.length === 0 && deductions.length === 0) return;

    const fetchPreview = async () => {
      const res = await api.post("/payslips/preview", { earnings, deductions });
      setPreview(res.data);
    };
    fetchPreview();
  }, [earnings, deductions]);

  const handleGenerateSingle = async () => {
    try {
      const res = await api.post("/payslips", {
        employeeId: selectedEmployeeId,
        month,
        year,
        workingDays,
        paidDays,
        lopDays,
        earnings,
        deductions,
      });
      setSavedPayslipId(res.data._id);
      alert("Payslip generated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleGenerateBulk = async () => {
    try {
      const res = await api.post("/payslips/bulk", {
        employeeId: selectedEmployeeId,
        startMonth: month,
        startYear: year,
        endMonth,
        endYear,
      });
      setBulkResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const downloadPDF = (id) => {
    window.open(`http://localhost:5000/api/payslips/${id}/pdf`, "_blank");
  };

  return (
    <div className="page">
      <h2>Generate Payslip</h2>

      <div className="card-form">
        <label>Employee</label>
        <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
          <option value="">-- Select Employee --</option>
          {employees.map((emp) => {
            const companyName = companies.find((c) => c._id === emp.companyId?._id || c._id === emp.companyId)?.name;
            return (
              <option key={emp._id} value={emp._id}>
                {emp.fullName} ({emp.employeeCode}) - {companyName}
              </option>
            );
          })}
        </select>

        <label>Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="single">Single Month</option>
          <option value="bulk">Bulk (Date Range)</option>
        </select>

        {mode === "single" && (
          <>
            <label>Month / Year</label>
            <div className="inline-row">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>

            <label>Attendance</label>
            <div className="inline-row">
              <input type="number" value={workingDays} onChange={(e) => setWorkingDays(Number(e.target.value))} placeholder="Working Days" />
              <input type="number" value={paidDays} onChange={(e) => setPaidDays(Number(e.target.value))} placeholder="Paid Days" />
              <input type="number" value={lopDays} onChange={(e) => setLopDays(Number(e.target.value))} placeholder="LOP Days" />
            </div>
          </>
        )}

        {mode === "bulk" && (
          <>
            <label>From</label>
            <div className="inline-row">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </div>
            <label>To</label>
            <div className="inline-row">
              <select value={endMonth} onChange={(e) => setEndMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <input type="number" value={endYear} onChange={(e) => setEndYear(Number(e.target.value))} />
            </div>
            <p className="hint">Bulk mode uses the employee's default baseline salary for every month.</p>
          </>
        )}
      </div>

      {employee && mode === "single" && (
        <div className="preview-canvas">
          <h3>Editable Preview</h3>
          <div className="line-item-row">
            <LineItemEditor title="Earnings" items={earnings} onChange={setEarnings} />
            <LineItemEditor title="Deductions" items={deductions} onChange={setDeductions} />
          </div>

          <div className="totals-box">
            <p>Gross Earnings: Rs. {preview.grossEarnings?.toFixed(2)}</p>
            <p>Total Deductions: Rs. {preview.totalDeductions?.toFixed(2)}</p>
            <p><strong>Net Salary: Rs. {preview.netSalary?.toFixed(2)}</strong></p>
            <p className="hint">{preview.netSalaryInWords}</p>
          </div>

          <button onClick={handleGenerateSingle}>Save & Generate Payslip</button>

          {savedPayslipId && (
            <button onClick={() => downloadPDF(savedPayslipId)}>Download PDF</button>
          )}
        </div>
      )}

      {employee && mode === "bulk" && (
        <div className="preview-canvas">
          <button onClick={handleGenerateBulk}>Generate Payslips for Range</button>

          {bulkResult && (
            <div>
              <h4>Created ({bulkResult.created.length})</h4>
              <ul>
                {bulkResult.created.map((p) => (
                  <li key={p._id}>
                    {p.month}/{p.year} - Rs. {p.netSalary.toFixed(2)}{" "}
                    <button onClick={() => downloadPDF(p._id)}>PDF</button>
                  </li>
                ))}
              </ul>

              {bulkResult.skipped.length > 0 && (
                <>
                  <h4>Skipped ({bulkResult.skipped.length})</h4>
                  <ul>
                    {bulkResult.skipped.map((s, i) => (
                      <li key={i}>{s.month}/{s.year} - {s.reason}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PayslipGenerate;
