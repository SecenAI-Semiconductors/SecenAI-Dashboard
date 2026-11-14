/**
 * phone.js — Indian phone number normalisation utility.
 *
 * Accepts any of:
 *   "9876543210"       → "9876543210"
 *   "+919876543210"    → "9876543210"
 *   "919876543210"     → "9876543210"
 *   "098-765-43210"    → "9876543210"  (10 digits after strip, leading 0 stripped)
 *
 * Returns null for invalid inputs.
 */

/**
 * Strip all non-digit characters, then:
 *  - 12 digits starting with "91"  → remove country code
 *  - 11 digits starting with "0"   → remove STD trunk prefix
 *  - 10 digits                     → use as-is
 *  - anything else                 → invalid
 *
 * Valid Indian mobile numbers start with 6–9.
 *
 * @param {string} raw
 * @returns {string|null}  10-digit normalised number or null
 */
function normalizePhone(raw) {
  if (!raw || typeof raw !== "string") return null;

  // Remove every non-digit character
  const digits = raw.replace(/\D/g, "");

  let ten;
  if (digits.length === 12 && digits.startsWith("91")) {
    ten = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    ten = digits.slice(1);
  } else if (digits.length === 10) {
    ten = digits;
  } else {
    return null;
  }

  // Must start with 6, 7, 8, or 9 (valid Indian mobile prefix)
  if (!/^[6-9]/.test(ten)) return null;

  return ten;
}

/**
 * Returns true if the raw string is a valid Indian mobile number.
 * @param {string} raw
 * @returns {boolean}
 */
function isValidIndianPhone(raw) {
  return normalizePhone(raw) !== null;
}

module.exports = { normalizePhone, isValidIndianPhone };

