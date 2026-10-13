import crypto from "crypto";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hashHex] = String(stored).split("$");
    if (scheme !== "scrypt" || !salt || !hashHex) return false;
    const actual = crypto.scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hashHex, "hex");
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function tokenHash(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}
