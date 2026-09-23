import crypto from 'node:crypto';

/** 6-digit OTP as string, e.g. '482913' */
export function genOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

/** sha256 hex of a value (OTP / token) — store hash, never the plain value. */
export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function verifyHash(value, hash) {
  const a = hashValue(value);
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(String(hash), 'hex');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * True if `lastSentAt` is still inside the cooldown window.
 * @param {Date|string|number|null} lastSentAt
 * @param {number} cooldownSeconds
 */
export function isOnCooldown(lastSentAt, cooldownSeconds = 60) {
  if (!lastSentAt) return false;
  const elapsed = Date.now() - new Date(lastSentAt).getTime();
  return elapsed < cooldownSeconds * 1000;
}

export function otpExpiryDate(ttlMinutes = 5) {
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}

export default { genOtp, hashValue, verifyHash, isOnCooldown, otpExpiryDate };
