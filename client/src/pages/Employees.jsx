// frontend/src/pages/Employees.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import DynamicField from "../components/DynamicField";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  ReceiptText,
  FileSpreadsheet,
  X,
  CreditCard,
  DollarSign,
} from "lucide-react";

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompanyId = searchParams.get("companyId") || "";

  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCompanyForForm, setSelectedCompanyForForm] = useState(null);

  const [formData, setFormData] = useState({
    companyId: "",
    employeeCode: "",
    fullName: "",
    email: "",
    designation: "",
    department: "",
    joiningDate: new Date().toISOString().split("T")[0],
    bankAccount: "",
    ifsc: "",
    customFields: {},
    baseSalary: {
      basic: 0,
      hra: 0,
      allowances: 0,
      pf: 0,
      professionalTax: 0,
      tds: 0,
    },
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      const [empRes, compRes] = await Promise.all([
        API.get(selectedCompanyId ? `/employees?companyId=${selectedCompanyId}` : "/employees"),
        API.get("/companies"),
      ]);
      setEmployees(empRes.data || []);
      setCompanies(compRes.data || []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId]);

  const handleCompanyFilterChange = (id) => {
    setSelectedCompanyId(id);
    if (id) setSearchParams({ companyId: id });
    else setSearchParams({});
  };

  const handleCompanySelectInForm = (companyId) => {
    const comp = companies.find((c) => c._id === companyId);
    setSelectedCompanyForForm(comp || null);

    // Pre-fill baseline salary from template defaults if available
    const template = comp?.templateId;
    let initialSalary = { ...formData.baseSalary };

    if (template) {
      (template.earningsSchema || []).forEach((e) => {
        if (e.label.toLowerCase().includes("basic")) initialSalary.basic = e.defaultAmount;
        else if (e.label.toLowerCase().includes("hra")) initialSalary.hra = e.defaultAmount;
        else initialSalary.allowances = e.defaultAmount;
      });
      (template.deductionSchema || []).forEach((d) => {
        if (d.label.toLowerCase().includes("provident") || d.label.toLowerCase().includes("pf"))
          initialSalary.pf = d.defaultAmount;
        else if (d.label.toLowerCase().includes("professional"))
          initialSalary.professionalTax = d.defaultAmount;
        else if (d.label.toLowerCase().includes("tds")) initialSalary.tds = d.defaultAmount;
      });
    }

    setFormData((prev) => ({
      ...prev,
      companyId,
      baseSalary: initialSalary,
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const targetCompId = selectedCompanyId || companies[0]?._id || "";
    const comp = companies.find((c) => c._id === targetCompId);
    setSelectedCompanyForForm(comp || null);

    setFormData({
      companyId: targetCompId,
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: "",
      email: "",
      designation: "",
      department: "",
      joiningDate: new Date().toISOString().split("T")[0],
      bankAccount: "",
      ifsc: "",
      customFields: {},
      baseSalary: {
        basic: 30000,
        hra: 12000,
        allowances: 8000,
        pf: 1800,
        professionalTax: 200,
        tds: 1500,
      },
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingId(emp._id);
    const comp = companies.find((c) => c._id === (emp.companyId?._id || emp.companyId));
    setSelectedCompanyForForm(comp || null);

    const customFieldsObj =
      emp.customFields instanceof Map
        ? Object.fromEntries(emp.customFields)
        : emp.customFields || {};

    setFormData({
      companyId: comp?._id || "",
      employeeCode: emp.employeeCode || "",
      fullName: emp.fullName || "",
      email: emp.email || "",
      designation: emp.designation || "",
      department: emp.department || "",
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
      bankAccount: emp.bankAccount || "",
      ifsc: emp.ifsc || "",
      customFields: customFieldsObj,
      baseSalary: {
        basic: emp.baseSalary?.basic || 0,
        hra: emp.baseSalary?.hra || 0,
        allowances: emp.baseSalary?.allowances || 0,
        pf: emp.baseSalary?.pf || 0,
        professionalTax: emp.baseSalary?.professionalTax || 0,
        tds: emp.baseSalary?.tds || 0,
      },
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee record?")) return;
    try {
      await API.delete(`/employees/${id}`);
      setEmployees(employees.filter((e) => e._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete employee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await API.put(`/employees/${editingId}`, formData);
      } else {
        await API.post("/employees", formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.designation && e.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeTemplate = selectedCompanyForForm?.templateId;
  const templateRequiredFields = activeTemplate?.requiredFields || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Employee Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic employee forms adapted to each company's active salary template.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={companies.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Company Dropdown Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCompanyId}
            onChange={(e) => handleCompanyFilterChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Companies ({companies.length})</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by employee name, code, or designation..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading employees...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No employees found</p>
          <p className="text-xs text-slate-400 mt-1">
            {companies.length === 0
              ? "Please create a company first before adding employees."
              : "Click 'Add Employee' to register personnel under this company."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4 text-left">Code</th>
                  <th className="py-3 px-4 text-left">Employee Name</th>
                  <th className="py-3 px-4 text-left">Company</th>
                  <th className="py-3 px-4 text-left">Role / Department</th>
                  <th className="py-3 px-4 text-left">Template Rules</th>
                  <th className="py-3 px-4 text-right">Base Net Salary</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp) => {
                  const comp = emp.companyId;
                  const tmpl = comp?.templateId;
                  const gross =
                    (emp.baseSalary?.basic || 0) +
                    (emp.baseSalary?.hra || 0) +
                    (emp.baseSalary?.allowances || 0);
                  const ded =
                    (emp.baseSalary?.pf || 0) +
                    (emp.baseSalary?.professionalTax || 0) +
                    (emp.baseSalary?.tds || 0);
                  const net = Math.max(0, gross - ded);

                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{emp.fullName}</span>
                        <span className="text-[11px] text-slate-400">{emp.email || "-"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {comp?.name || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">
                          {emp.designation || "-"}
                        </span>
                        <span className="text-[10px] text-slate-400">{emp.department || "-"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {tmpl?.templateName || "Default"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ₹ {net.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link
                          to={`/generate?employeeId=${emp._id}`}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <ReceiptText className="w-3 h-3" /> Slip
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors inline-block align-middle"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-block align-middle"
                          title="Delete Employee"
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

      {/* Dynamic Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? "Edit Employee Record" : "Add Employee Under Company"}
                </h3>
                {activeTemplate && (
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                    Governed by active template: {activeTemplate.templateName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Company Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company *</label>
                <select
                  required
                  value={formData.companyId}
                  disabled={Boolean(editingId)}
                  onChange={(e) => handleCompanySelectInForm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 font-medium disabled:opacity-60"
                >
                  <option value="" disabled>Select Company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.templateId?.templateName || "Template"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Details */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  1. Basic Employee Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employee Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                      placeholder="e.g. EMP-101"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@company.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Fields Enforced by the Active Template */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                    2. Template-Mandated & Custom Fields
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Fields dynamically shown per company template
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-200">
                  {/* Bank Account & IFSC */}
                  <DynamicField
                    fieldKey="bankAccount"
                    value={formData.bankAccount}
                    onChange={(val) => setFormData({ ...formData, bankAccount: val })}
                    isRequired={templateRequiredFields.includes("bankAccount")}
                  />
                  <DynamicField
                    fieldKey="ifsc"
                    value={formData.ifsc}
                    onChange={(val) => setFormData({ ...formData, ifsc: val })}
                    isRequired={templateRequiredFields.includes("ifsc")}
                  />
                  <DynamicField
                    fieldKey="department"
                    value={formData.department}
                    onChange={(val) => setFormData({ ...formData, department: val })}
                    isRequired={templateRequiredFields.includes("department")}
                  />

                  {/* Template Required Fields (e.g. pan, uan, pfNumber) */}
                  {templateRequiredFields
                    .filter((f) => !["bankAccount", "ifsc", "department"].includes(f))
                    .map((fieldKey) => (
                      <DynamicField
                        key={fieldKey}
                        fieldKey={fieldKey}
                        value={formData.customFields?.[fieldKey] || ""}
                        onChange={(val) =>
                          setFormData({
                            ...formData,
                            customFields: { ...formData.customFields, [fieldKey]: val },
                          })
                        }
                        isRequired={true}
                      />
                    ))}
                </div>
              </div>

              {/* Baseline Compensation Structure */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                  3. Default Baseline Salary Structure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Basic Pay (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.basic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, basic: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">HRA (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.hra}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, hra: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Allowances (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.allowances}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, allowances: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Provident Fund (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.pf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, pf: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prof. Tax (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.professionalTax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, professionalTax: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">TDS / Income Tax (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.baseSalary.tds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          baseSalary: { ...formData.baseSalary, tds: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm shadow-indigo-200 transition-colors disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Save Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
