import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

// shows all companies, and lets you create a new one at the top

function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    gstin: "",
    pan: "",
    website: "",
    templateId: "",
  });

  useEffect(() => {
    fetchCompanies();
    fetchTemplates();
  }, []);

  const fetchCompanies = async () => {
    const res = await api.get("/companies");
    setCompanies(res.data);
  };

  const fetchTemplates = async () => {
    const res = await api.get("/templates");
    setTemplates(res.data);
    // default the select to the first template if none chosen yet
    if (res.data.length > 0) {
      setForm((prev) => ({ ...prev, templateId: prev.templateId || res.data[0]._id }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/companies", form);
      alert("Company created!");
      setForm({
        name: "",
        email: "",
        contactNumber: "",
        address: "",
        gstin: "",
        pan: "",
        website: "",
        templateId: templates[0]?._id || "",
      });
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    await api.delete(`/companies/${id}`);
    fetchCompanies();
  };

  return (
    <div className="page">
      <h2>Companies</h2>

      <form onSubmit={handleSubmit} className="card-form">
        <h3>Add New Company</h3>
        <input name="name" placeholder="Company Name" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <input name="gstin" placeholder="GSTIN" value={form.gstin} onChange={handleChange} />
        <input name="pan" placeholder="PAN" value={form.pan} onChange={handleChange} />
        <input name="website" placeholder="Website" value={form.website} onChange={handleChange} />

        <select name="templateId" value={form.templateId} onChange={handleChange} required>
          <option value="">Select Salary Template</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>
              {t.templateName}
            </option>
          ))}
        </select>

        <button type="submit">Create Company</button>
      </form>

      <h3>Existing Companies</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Template</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.templateId?.templateName}</td>
              <td>
                <div className="action-group">
                  <Link to={`/companies/${c._id}/employees/new`}>+ Employee</Link>
                  <Link to={`/companies/${c._id}/employees`}>View</Link>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompanyList;
