// backend/src/utils/encryption.js
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const RAW_KEY = process.env.ENCRYPTION_KEY || "default_super_secret_key_32_bytes_payroll";
// Ensure key is exactly 32 bytes
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest();
const IV_LENGTH = 16;

/**
 * Encrypts a plaintext string
 * @param {string} text Plaintext to encrypt
 * @returns {string} Encrypted string in format "iv:ciphertext"
 */
function encrypt(text) {
  if (!text || typeof text !== "string") return text;
  // If already encrypted, avoid double encryption
  if (/^[0-9a-f]{32}:[0-9a-f]+$/i.test(text)) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an encrypted string in format "iv:ciphertext"
 * @param {string} text Encrypted text
 * @returns {string} Plaintext
 */
function decrypt(text) {
  if (!text || typeof text !== "string") return text;
  // Check if string matches format iv:ciphertext
  const parts = text.split(":");
  if (parts.length !== 2 || parts[0].length !== 32) {
    return text; // Return as is if not encrypted
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("Decryption error; returning original string:", err.message);
    return text;
  }
}

module.exports = {
  encrypt,
  decrypt,
};
