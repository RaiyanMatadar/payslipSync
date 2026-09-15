// numberToWords.js
// Simple converter to turn the net salary number into words for the payslip.
// Only handles Indian numbering (Lakh/Crore) since GSTIN/PAN fields suggest
// this project targets Indian companies. Not perfect for huge numbers but
// good enough for typical salary ranges.

const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(num) {
  if (num < 20) return ones[num];
  const t = Math.floor(num / 10);
  const o = num % 10;
  return tens[t] + (o ? " " + ones[o] : "");
}

function threeDigits(num) {
  const h = Math.floor(num / 100);
  const rest = num % 100;
  let str = "";
  if (h) str += ones[h] + " Hundred ";
  if (rest) str += twoDigits(rest);
  return str.trim();
}

function numberToWords(num) {
  num = Math.round(num);
  if (num === 0) return "Zero Rupees Only";

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  if (crore) result += threeDigits(crore) + " Crore ";
  if (lakh) result += threeDigits(lakh) + " Lakh ";
  if (thousand) result += threeDigits(thousand) + " Thousand ";
  if (hundred) result += threeDigits(hundred);

  return "Rupees " + result.trim() + " Only";
}

module.exports = numberToWords;
