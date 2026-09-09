import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand-logo">
        <div className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <circle cx="6" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">Payroll</span>
        </div>
      </Link>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          Companies
        </NavLink>
        <NavLink to="/templates" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          Templates
        </NavLink>
        <NavLink to="/generate" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
          Generate Payslip
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
