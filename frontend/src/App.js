import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CompanyList from "./pages/CompanyList";
import TemplateList from "./pages/TemplateList";
import EmployeeForm from "./pages/EmployeeForm";
import EmployeeList from "./pages/EmployeeList";
import PayslipGenerate from "./pages/PayslipGenerate";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CompanyList />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/companies/:companyId/employees" element={<EmployeeList />} />
        <Route path="/companies/:companyId/employees/new" element={<EmployeeForm />} />
        <Route path="/generate" element={<PayslipGenerate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
