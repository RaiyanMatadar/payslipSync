import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

function EmployeeList() {
  const { companyId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    api.get(`/companies/${companyId}`).then((res) => setCompany(res.data));
    api.get(`/employees?companyId=${companyId}`).then((res) => setEmployees(res.data));
  }, [companyId]);

  return (
    <div className="page">
      <h2>Employees {company ? `- ${company.name}` : ""}</h2>
      <Link to={`/companies/${companyId}/employees/new`}>+ Add New Employee</Link>

      <table className="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td>{emp.employeeCode}</td>
              <td>{emp.fullName}</td>
              <td>{emp.designation}</td>
              <td>
                <div className="action-group">
                  <Link to={`/generate?employeeId=${emp._id}`}>⚡ Generate Payslip</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
