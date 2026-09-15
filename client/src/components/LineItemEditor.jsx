// frontend/src/components/LineItemEditor.jsx
import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function LineItemEditor({
  title,
  items = [],
  onChange,
  type = "earning", // "earning" | "deduction"
  suggestions = [],
}) {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value,
    };
    onChange(updated);
  };

  const handleAddItem = (label = "", amount = 0) => {
    onChange([...items, { label: label || `Item ${items.length + 1}`, amount: Number(amount) || 0 }]);
  };

  const handleDeleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const isDeduction = type === "deduction";
  const accentColor = isDeduction ? "text-rose-600" : "text-emerald-600";
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isDeduction ? "bg-rose-500" : "bg-emerald-500"}`}></span>
          {title} ({items.length})
        </h4>
        <span className={`text-xs font-bold ${accentColor}`}>
          Total: Rs. {subtotal.toFixed(2)}
        </span>
      </div>

      {/* Items List */}
      <div className="p-3 space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center italic">No items added yet</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                placeholder="Component Name"
                onChange={(e) => handleItemChange(index, "label", e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
              />
              <div className="relative w-28 sm:w-36">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.amount === "" ? "" : item.amount}
                  placeholder="0.00"
                  onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                  className="w-full pl-6 pr-2.5 py-1.5 text-xs text-right font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(index)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}

        {/* Add Button & Quick Suggestions */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddItem("", 0)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add {isDeduction ? "Deduction" : "Earning"}
          </button>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 ml-auto">
              <span className="text-[10px] text-slate-400 font-medium">Quick add:</span>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddItem(sug, 0)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium transition-colors"
                >
                  +{sug}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
