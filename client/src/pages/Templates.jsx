// frontend/src/pages/Templates.jsx
import React, { useState, useEffect } from "react";
import API from "../api/axios";
import {
  FileSpreadsheet,
  Eye,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ListChecks,
  Coins,
  Receipt,
  X,
} from "lucide-react";

const AVAILABLE_FIELDS = [
  { key: "pan", label: "PAN Card No (Encrypted)" },
  { key: "uan", label: "UAN (Universal Account Number)" },
  { key: "pfNumber", label: "PF Account Number" },
  { key: "bankAccount", label: "Bank Account Number" },
  { key: "ifsc", label: "IFSC Code" },
  { key: "department", label: "Department / Division" },
];

const formatTemplateDate = (date) =>
  date ? new Date(date).toLocaleString() : "Not available";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    templateKey: "",
    templateName: "",
    description: "",
    requiredFields: [],
    earningsSchema: [],
    deductionSchema: [],
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [viewingTemplate, setViewingTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const res = await API.get("/templates");
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Failed to load templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      templateKey: "",
      templateName: "",
      description: "",
      requiredFields: ["bankAccount"],
      earningsSchema: [
        { label: "Basic Pay", defaultAmount: 25000 },
        { label: "HRA", defaultAmount: 10000 },
        { label: "Allowances", defaultAmount: 5000 },
      ],
      deductionSchema: [
        { label: "Provident Fund", defaultAmount: 1800 },
        { label: "Professional Tax", defaultAmount: 200 },
        { label: "TDS", defaultAmount: 1000 },
      ],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tmpl) => {
    setEditingId(tmpl._id);
    setFormData({
      templateKey: tmpl.templateKey,
      templateName: tmpl.templateName,
      description: tmpl.description || "",
      requiredFields: tmpl.requiredFields || [],
      earningsSchema: tmpl.earningsSchema || [],
      deductionSchema: tmpl.deductionSchema || [],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salary template? Note: Past payslips using it will keep their snapshots.")) return;
    try {
      await API.delete(`/templates/${id}`);
      setTemplates(templates.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete template");
    }
  };

  const handleToggleField = (fieldKey) => {
    const current = [...formData.requiredFields];
    if (current.includes(fieldKey)) {
      setFormData({ ...formData, requiredFields: current.filter((f) => f !== fieldKey) });
    } else {
      setFormData({ ...formData, requiredFields: [...current, fieldKey] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await API.put(`/templates/${editingId}`, formData);
      } else {
        await API.post("/templates", formData);
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" /> Salary Slip Templates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rules governing employee form requirements and standard baseline salary structures.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {template.templateName}
                      </h3>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {template.templateKey}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {template.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingTemplate(template)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Template Details"
                      aria-label={`View details for ${template.templateName}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(template)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Required Fields Section */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                    Enforced Employee Fields ({template.requiredFields?.length || 0}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {template.requiredFields?.length > 0 ? (
                      template.requiredFields.map((field) => (
                        <span
                          key={field}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 font-semibold text-[11px]"
                        >
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">None (only base profile)</span>
                    )}
                  </div>
                </div>

                {/* Earnings & Deductions Blueprint Preview */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                  {/* Earnings */}
                  <div className="p-3 bg-slate-50/70 rounded-xl space-y-1.5 border border-slate-100">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" /> Default Earnings
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {template.earningsSchema?.map((e, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{e.label}</span>
                          <span className="font-mono text-slate-800">₹{e.defaultAmount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deductions */}
                  <div className="p-3 bg-slate-50/70 rounded-xl space-y-1.5 border border-slate-100">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                      <Receipt className="w-3.5 h-3.5 text-rose-600" /> Default Deductions
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {template.deductionSchema?.map((d, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{d.label}</span>
                          <span className="font-mono text-slate-800">₹{d.defaultAmount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Details Modal */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingTemplate.templateName}</h3>
                <span className="font-mono text-[10px] font-bold text-slate-500">
                  {viewingTemplate.templateKey}
                </span>
              </div>
              <button
                onClick={() => setViewingTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Close Template Details"
                aria-label="Close Template Details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                {viewingTemplate.description || "No description provided."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Template ID</span>
                  <span className="block mt-1 font-mono text-[11px] text-slate-700 break-all">{viewingTemplate._id}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Created</span>
                  <span className="block mt-1 text-slate-700">{formatTemplateDate(viewingTemplate.createdAt)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Updated</span>
                  <span className="block mt-1 text-slate-700">{formatTemplateDate(viewingTemplate.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                  Enforced Employee Fields
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingTemplate.requiredFields?.length > 0 ? (
                    viewingTemplate.requiredFields.map((field) => (
                      <span
                        key={field}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 font-semibold text-[11px]"
                      >
                        {AVAILABLE_FIELDS.find((availableField) => availableField.key === field)?.label || field}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None (only base profile)</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="p-3 bg-slate-50/70 rounded-xl space-y-2 border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" /> Default Earnings
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {viewingTemplate.earningsSchema?.length || 0} component(s) | Total: ₹{(viewingTemplate.earningsSchema || []).reduce((total, earning) => total + Number(earning.defaultAmount || 0), 0)}
                  </span>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    {viewingTemplate.earningsSchema?.length > 0 ? (
                      viewingTemplate.earningsSchema.map((earning, index) => (
                        <li key={index} className="flex justify-between gap-3">
                          <span>{earning.label}</span>
                          <span className="font-mono text-slate-800">₹{earning.defaultAmount}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No default earnings</li>
                    )}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-xl space-y-2 border border-slate-100">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                    <Receipt className="w-3.5 h-3.5 text-rose-600" /> Default Deductions
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {viewingTemplate.deductionSchema?.length || 0} component(s) | Total: ₹{(viewingTemplate.deductionSchema || []).reduce((total, deduction) => total + Number(deduction.defaultAmount || 0), 0)}
                  </span>
                  <ul className="space-y-1.5 text-slate-600 text-[11px]">
                    {viewingTemplate.deductionSchema?.length > 0 ? (
                      viewingTemplate.deductionSchema.map((deduction, index) => (
                        <li key={index} className="flex justify-between gap-3">
                          <span>{deduction.label}</span>
                          <span className="font-mono text-slate-800">₹{deduction.defaultAmount}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No default deductions</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Salary Template" : "Create Salary Template"}
              </h3>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="e.g. Enterprise Compliance Template"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unique Key Identifier *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingId)}
                  value={formData.templateKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateKey: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="e.g. enterprise-compliance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when to use this template..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Required Fields Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Required Employee Fields
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {AVAILABLE_FIELDS.map((f) => {
                    const isChecked = formData.requiredFields.includes(f.key);
                    return (
                      <label
                        key={f.key}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? "bg-indigo-50 border border-indigo-200 text-indigo-900" : "hover:bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleField(f.key)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium">{f.label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Employee forms for companies using this template will dynamically enforce these fields.
                </p>
              </div>

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
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
