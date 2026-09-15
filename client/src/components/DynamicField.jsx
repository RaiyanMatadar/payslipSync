// frontend/src/components/DynamicField.jsx
import React from "react";

const FIELD_METADATA = {
  pan: {
    label: "PAN (Permanent Account Number)",
    placeholder: "e.g. ABCDE1234F",
    uppercase: true,
    help: "10-character alphanumeric tax ID (encrypted)",
  },
  uan: {
    label: "UAN (Universal Account Number)",
    placeholder: "e.g. 100123456789",
    help: "12-digit EPF number (encrypted)",
  },
  pfNumber: {
    label: "PF Number",
    placeholder: "e.g. MH/BAN/0012345/000/0001",
    help: "Provident Fund account identifier",
  },
  bankAccount: {
    label: "Bank Account Number",
    placeholder: "e.g. 987654321012",
    help: "Account for salary disbursement",
  },
  ifsc: {
    label: "IFSC Code",
    placeholder: "e.g. SBIN0001234",
    uppercase: true,
    help: "11-character bank branch code",
  },
  department: {
    label: "Department",
    placeholder: "e.g. Engineering / Finance / Operations",
  },
};

export default function DynamicField({
  fieldKey,
  value,
  onChange,
  isRequired = false,
  error = "",
}) {
  const meta = FIELD_METADATA[fieldKey] || {
    label: fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
    placeholder: `Enter ${fieldKey}`,
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (meta.uppercase) {
      val = val.toUpperCase();
    }
    onChange(val);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          {meta.label}
          {isRequired ? (
            <span className="text-red-500 ml-1 font-bold">*</span>
          ) : (
            <span className="text-[10px] text-slate-400 ml-1 font-normal">(optional)</span>
          )}
        </label>
        {isRequired && (
          <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
            Required by Template
          </span>
        )}
      </div>

      <input
        type="text"
        value={value || ""}
        onChange={handleChange}
        placeholder={meta.placeholder}
        required={isRequired}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-indigo-500"
        }`}
      />

      {meta.help && <p className="text-[11px] text-slate-400">{meta.help}</p>}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
