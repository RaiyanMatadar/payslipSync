// backend/src/utils/salaryCalculator.js
const numberToWords = require("./numberToWords");

/**
 * Rounds a number to exactly two decimal places avoiding standard float bugs
 * @param {number} num
 * @returns {number}
 */
function round2(num) {
  const n = Number(num);
  if (isNaN(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Sums an array of line items with amount property
 * @param {Array<{ label: string, amount: number }>} items
 * @returns {number}
 */
function sumLineItems(items) {
  if (!Array.isArray(items)) return 0;
  const total = items.reduce((acc, item) => {
    const val = Number(item?.amount || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  return round2(total);
}

/**
 * Calculates financial totals from earnings and deductions arrays
 * @param {Object} params
 * @param {Array} params.earnings
 * @param {Array} params.deductions
 * @returns {Object} { grossEarnings, totalDeductions, netSalary, netSalaryInWords }
 */
function calculatePayslipTotals({ earnings = [], deductions = [] }) {
  const grossEarnings = sumLineItems(earnings);
  const totalDeductions = sumLineItems(deductions);
  const netSalary = round2(Math.max(0, grossEarnings - totalDeductions));
  const netSalaryInWords = numberToWords(netSalary);

  return {
    grossEarnings,
    totalDeductions,
    netSalary,
    netSalaryInWords,
  };
}

module.exports = {
  round2,
  sumLineItems,
  calculatePayslipTotals,
};
