// backend/src/utils/numberToWords.js
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

/**
 * Converts a number to words in Indian numbering system
 * @param {number} amount Amount in INR
 * @returns {string} Text in words
 */
function numberToWords(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num <= 0) return "Rupees Zero Only";

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

  const cleanResult = result.trim();
  return cleanResult ? `Rupees ${cleanResult} Only` : "Rupees Zero Only";
}

module.exports = numberToWords;
