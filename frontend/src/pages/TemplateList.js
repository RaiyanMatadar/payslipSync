import React, { useEffect, useState } from "react";
import api from "../api/axios";

// simple CRUD-ish page for templates. Not fully polished since templates
// are usually set up once at the start (per the project brief).

function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    templateKey: "",
    templateName: "",
    description: "",
    requiredFieldsText: "", // comma separated, easier for a plain input
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await api.get("/templates");
    setTemplates(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = form.requiredFieldsText
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    await api.post("/templates", {
      templateKey: form.templateKey,
      templateName: form.templateName,
      description: form.description,
      requiredFields,
      earningsSchema: [
        { label: "Basic Pay", defaultAmount: 0 },
        { label: "HRA", defaultAmount: 0 },
        { label: "Allowances", defaultAmount: 0 },
      ],
      deductionSchema: [
        { label: "Provident Fund", defaultAmount: 0 },
        { label: "TDS", defaultAmount: 0 },
      ],
    });

    setForm({ templateKey: "", templateName: "", description: "", requiredFieldsText: "" });
    fetchTemplates();
  };

  return (
    <div className="page">
      <h2>Salary Templates</h2>

      <form onSubmit={handleSubmit} className="card-form">
        <h3>Add New Template</h3>
        <input
          name="templateKey"
          placeholder="Template Key (e.g. corporate-detailed)"
          value={form.templateKey}
          onChange={handleChange}
          required
        />
        <input
          name="templateName"
          placeholder="Template Name"
          value={form.templateName}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          name="requiredFieldsText"
          placeholder="Required fields, comma separated (pan, uan, bankAccount)"
          value={form.requiredFieldsText}
          onChange={handleChange}
        />
        <button type="submit">Create Template</button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Key</th>
            <th>Required Fields</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t._id}>
              <td>{t.templateName}</td>
              <td>{t.templateKey}</td>
              <td>{t.requiredFields.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TemplateList;
