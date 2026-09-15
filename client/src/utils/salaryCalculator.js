// frontend/src/utils/salaryCalculator.js

export function round2(num) {
  const n = Number(num);
  if (isNaN(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function sumLineItems(items = []) {
  if (!Array.isArray(items)) return 0;
  const total = items.reduce((acc, item) => {
    const val = Number(item?.amount || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  return round2(total);
}

export function convertNumberToWords(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num <= 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o ? " " + ones[o] : "");
  }

  function threeDigits(n) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (h) str += ones[h] + " Hundred ";
    if (rest) str += twoDigits(rest);
    return str.trim();
  }

  let n = num;
  let result = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  if (crore) result += threeDigits(crore) + " Crore ";
  if (lakh) result += threeDigits(lakh) + " Lakh ";
  if (thousand) result += threeDigits(thousand) + " Thousand ";
  if (hundred) result += threeDigits(hundred);

  const clean = result.trim();
  return clean ? `Rupees ${clean} Only` : "Rupees Zero Only";
}

export function calculateTotals({ earnings = [], deductions = [] }) {
  const grossEarnings = sumLineItems(earnings);
  const totalDeductions = sumLineItems(deductions);
  const netSalary = round2(Math.max(0, grossEarnings - totalDeductions));
  const netSalaryInWords = convertNumberToWords(netSalary);

  return {
    grossEarnings,
    totalDeductions,
    netSalary,
    netSalaryInWords,
  };
}
