// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  Building2,
  FileSpreadsheet,
  Users,
  ReceiptText,
  Plus,
  ArrowUpRight,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    companiesCount: 0,
    templatesCount: 0,
    employeesCount: 0,
    payslipsCount: 0,
  });
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companiesRes, templatesRes, employeesRes, payslipsRes] = await Promise.all([
          API.get("/companies"),
          API.get("/templates"),
          API.get("/employees"),
          API.get("/payslips"),
        ]);

        setStats({
          companiesCount: companiesRes.data?.length || 0,
          templatesCount: templatesRes.data?.length || 0,
          employeesCount: employeesRes.data?.length || 0,
          payslipsCount: payslipsRes.data?.length || 0,
        });

        setRecentPayslips((payslipsRes.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: "Managed Companies",
      count: stats.companiesCount,
      icon: Building2,
      color: "from-blue-600 to-indigo-600",
      link: "/companies",
      subtext: "With custom logos & templates",
    },
    {
      label: "Active Templates",
      count: stats.templatesCount,
      icon: FileSpreadsheet,
      color: "from-purple-600 to-indigo-600",
      link: "/templates",
      subtext: "Rules & field requirements",
    },
    {
      label: "Total Employees",
      count: stats.employeesCount,
      icon: Users,
      color: "from-emerald-600 to-teal-600",
      link: "/employees",
      subtext: "Across all registered companies",
    },
    {
      label: "Generated Payslips",
      count: stats.payslipsCount,
      icon: ReceiptText,
      color: "from-amber-500 to-orange-600",
      link: "/payslips",
      subtext: "Frozen historical snapshots",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Fast, Multi-Tenant Payroll
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Payroll & Salary Slip Management System
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Manage multiple companies, customize compliance templates, add dynamic employee records,
            and generate high-resolution salary slips with live editable previews and dual export.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" /> Generate New Payslip
            </Link>
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg backdrop-blur transition-colors"
            >
              Manage Companies
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : card.count}
                </span>
                <h3 className="text-xs font-bold text-slate-600 mt-0.5">{card.label}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{card.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Bar & Recent Payslips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Payslips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Generated Payslips</h3>
              <p className="text-xs text-slate-400">Latest immutable salary slip snapshots</p>
            </div>
            <Link
              to="/payslips"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading payslips...</div>
          ) : recentPayslips.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <ReceiptText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No payslips generated yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Generate your first salary slip in Single or Bulk mode.
              </p>
              <Link
                to="/generate"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Generate Now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="text-left pb-2">Employee</th>
                    <th className="text-left pb-2">Company</th>
                    <th className="text-left pb-2">Period</th>
                    <th className="text-right pb-2">Net Pay</th>
                    <th className="text-right pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayslips.map((slip) => (
                    <tr key={slip._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">
                        {slip.snapshotData?.employeeName || slip.employeeId?.fullName || "Employee"}
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {slip.snapshotData?.employeeCode || slip.employeeId?.employeeCode || "-"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {slip.snapshotData?.companyName || slip.companyId?.name || "Company"}
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {slip.month}/{slip.year}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        ₹ {Number(slip.netSalary || 0).toFixed(2)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/payslips/${slip._id}/edit`}
                          className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
                        >
                          Preview / Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Quick Guidance & System Highlights */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">System Workflow</h3>
            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <b>Create a Company</b> with its official logo (stored securely on Cloudinary) and link it to a template.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <b>Add Employees</b> — the form dynamically displays only the fields required by the company's active template.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <b>Generate & Edit</b> in Single or Bulk mode with live WYSIWYG preview and automatic word conversion.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  <b>Export as PDF</b> (single A4 file) or download a <b>ZIP bundle</b> of multiple salary slips.
                </span>
              </li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 p-5">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
              Field Security & Storage
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              PAN, GSTIN, and sensitive tax identifiers are encrypted in the database via AES-256. Company logos are stored directly in Cloudinary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
