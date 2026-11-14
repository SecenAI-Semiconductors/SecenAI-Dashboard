/**
 * tempPassword.js — Cryptographically random temporary password generator.
 *
 * Generates a 12-character password mixing upper/lower case letters,
 * digits, and selected special characters.  Does not use Math.random().
 */

const crypto = require("crypto");

const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";

/**
 * @returns {string} 12-character temporary password
 */
function generateTempPassword() {
  let password = "";
  while (password.length < 12) {
    const byte = crypto.randomBytes(1)[0];
    // Reject bytes that fall outside the charset range to avoid modulo bias
    if (byte < CHARSET.length * Math.floor(256 / CHARSET.length)) {
      password += CHARSET[byte % CHARSET.length];
    }
  }
  return password;
}

module.exports = { generateTempPassword };

