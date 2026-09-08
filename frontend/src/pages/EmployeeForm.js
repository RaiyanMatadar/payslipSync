import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

// This is the "dynamic form" page - it looks at the company's active
// template.requiredFields and only renders inputs for those fields.
// e.g. Template A shows PAN/UAN/PF fields, Template B just shows bank account.

// a couple of fields are "known" and get proper input types/labels,
// anything else in requiredFields just becomes a generic text input
const FIELD_LABELS = {
  pan: "PAN Number",
  uan: "UAN Number",
  pfNumber: "PF Number",
  bankAccount: "Bank Account Number",
  ifsc: "IFSC Code",
  department: "Department",
};

function EmployeeForm() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    designation: "",
    joiningDate: "",
    bankAccount: "",
    ifsc: "",
    department: "",
    baseSalary: {
      basic: 0,
      hra: 0,
      allowances: 0,
      pf: 0,
      professionalTax: 0,
      tds: 0,
    },
    customFields: {},
  });

  useEffect(() => {
    const loadCompany = async () => {
      const res = await api.get(`/companies/${companyId}`);
      setCompany(res.data);
    };
    loadCompany();
  }, [companyId]);

  if (!company) return <div className="page">Loading company info...</div>;

  const requiredFields = company.templateId.requiredFields || [];

  const handleBasicChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSalaryChange = (e) => {
    setForm({
      ...form,
      baseSalary: { ...form.baseSalary, [e.target.name]: Number(e.target.value) },
    });
  };

  // handles both "known" fields (bankAccount, ifsc, department are top level
  // on the Employee model) and truly custom ones (pan, uan, pfNumber -> customFields)
  const handleDynamicChange = (field, value) => {
    if (["bankAccount", "ifsc", "department"].includes(field)) {
      setForm({ ...form, [field]: value });
    } else {
      setForm({
        ...form,
        customFields: { ...form.customFields, [field]: value },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/employees", { ...form, companyId });
      alert("Employee added!");
      navigate(`/companies/${companyId}/employees`);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="page">
      <h2>Add Employee — {company.name}</h2>
      <p className="hint">
        Using template: <strong>{company.templateId.templateName}</strong>. Fields below
        change automatically based on the template.
      </p>

      <form onSubmit={handleSubmit} className="card-form">
        <h3>Basic Details</h3>
        <input
          name="employeeCode"
          placeholder="Employee Code"
          value={form.employeeCode}
          onChange={handleBasicChange}
          required
        />
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleBasicChange}
          required
        />
        <input name="email" placeholder="Email" value={form.email} onChange={handleBasicChange} />
        <input
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={handleBasicChange}
        />
        <input
          type="date"
          name="joiningDate"
          value={form.joiningDate}
          onChange={handleBasicChange}
        />

        <h3>Template-Specific Fields</h3>
        {requiredFields.length === 0 && <p>This template has no extra required fields.</p>}
        {requiredFields.map((field) => (
          <input
            key={field}
            placeholder={FIELD_LABELS[field] || field}
            value={
              ["bankAccount", "ifsc", "department"].includes(field)
                ? form[field]
                : form.customFields[field] || ""
            }
            onChange={(e) => handleDynamicChange(field, e.target.value)}
          />
        ))}

        <h3>Baseline Compensation (Monthly)</h3>
        <label>Basic Pay</label>
        <input type="number" name="basic" value={form.baseSalary.basic} onChange={handleSalaryChange} />
        <label>HRA</label>
        <input type="number" name="hra" value={form.baseSalary.hra} onChange={handleSalaryChange} />
        <label>Allowances</label>
        <input
          type="number"
          name="allowances"
          value={form.baseSalary.allowances}
          onChange={handleSalaryChange}
        />
        <label>Provident Fund (deduction)</label>
        <input type="number" name="pf" value={form.baseSalary.pf} onChange={handleSalaryChange} />
        <label>Professional Tax (deduction)</label>
        <input
          type="number"
          name="professionalTax"
          value={form.baseSalary.professionalTax}
          onChange={handleSalaryChange}
        />
        <label>TDS (deduction)</label>
        <input type="number" name="tds" value={form.baseSalary.tds} onChange={handleSalaryChange} />

        <button type="submit">Save Employee</button>
      </form>
    </div>
  );
}

export default EmployeeForm;
