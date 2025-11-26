// api/_jwt.js
const crypto = require("crypto");
const config = require("./_config");

function base64urlEncode(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj);
  return Buffer.from(json)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = 4 - (str.length % 4);
  if (pad !== 4) {
    str += "=".repeat(pad);
  }
  return Buffer.from(str, "base64").toString("utf8");
}

function signHS256(data, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// OPTIMIZED: Single pass cookie parsing, no array mutations
function parseCookies(header) {
  if (!header) return {};

  const list = {};
  const cookies = header.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const eqIndex = cookies[i].indexOf("=");
    if (eqIndex === -1) continue;

    const key = cookies[i].substring(0, eqIndex).trim();
    const value = decodeURIComponent(cookies[i].substring(eqIndex + 1));
    list[key] = value;
  }

  return list;
}

const JWT_SECRET = config.JWT_SECRET;

function createJwt(username) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: username,
    role: config.ROLES.CUSTOMER, // IMPORTANT: default role
    iat: Math.floor(Date.now() / 1000),
  };

  const headerB64 = base64urlEncode(header);
  const payloadB64 = base64urlEncode(payload);
  const data = `${headerB64}.${payloadB64}`;
  const signature = signHS256(data, JWT_SECRET);
  return `${data}.${signature}`;
}

// VULNERABLE verification: supports alg:"none" and trusts payload role
function verifyJwt(token) {
  if (!token) throw new Error("Missing token");

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [headerB64, payloadB64, signature] = parts;
  let headerJson, payloadJson;

  try {
    headerJson = JSON.parse(base64urlDecode(headerB64));
    payloadJson = JSON.parse(base64urlDecode(payloadB64));
  } catch (e) {
    throw new Error(`Invalid token JSON: ${e.message}`);
  }

  const alg = headerJson.alg;

  // ---- CTF BUG: if alg is "none", we just trust the payload ----
  if (alg === "none") {
    return payloadJson;
  }

  if (alg === "HS256") {
    const data = `${headerB64}.${payloadB64}`;
    const expected = signHS256(data, JWT_SECRET);
    if (expected !== signature) {
      throw new Error("Invalid signature");
    }
    return payloadJson;
  }

  throw new Error("Unsupported alg");
}

// NEW: Shared cookie creation utility
function createSessionCookie(token, maxAge = null) {
  const parts = [
    `session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    // "Secure",
  ];

  if (maxAge !== null) {
    parts.push(`Max-Age=${maxAge}`);
  }

  return parts.join("; ");
}

module.exports = {
  base64urlEncode,
  base64urlDecode,
  signHS256,
  parseCookies,
  JWT_SECRET,
  createJwt,
  verifyJwt,
  createSessionCookie,
};
