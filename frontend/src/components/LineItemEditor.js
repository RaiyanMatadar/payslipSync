import React from "react";

// reusable table for editing earnings or deductions on the preview canvas.
// props:
//   title - "Earnings" or "Deductions"
//   items - array of {label, amount}
//   onChange - called with the new array whenever something changes
function LineItemEditor({ title, items, onChange }) {
  const handleLabelChange = (index, value) => {
    const updated = [...items];
    updated[index].label = value;
    onChange(updated);
  };

  const handleAmountChange = (index, value) => {
    const updated = [...items];
    updated[index].amount = Number(value);
    onChange(updated);
  };

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([...items, { label: "New Item", amount: 0 }]);
  };

  return (
    <div className="line-item-editor">
      <h4>{title}</h4>
      <table>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.amount}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                />
              </td>
              <td>
                <button type="button" onClick={() => handleDelete(index)}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={handleAddRow}>
        + Add {title.slice(0, -1)}
      </button>
    </div>
  );
}

export default LineItemEditor;
