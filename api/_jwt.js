// api/_jwt.js
const crypto = require("crypto");

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

function parseCookies(header) {
  const list = {};
  if (!header) return list;
  header.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join("="));
    list[key] = value;
  });
  return list;
}

const JWT_SECRET = "super-secret-cyberhawks-bank-key";

function createJwt(username) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: username,
    role: "customer", // IMPORTANT: default role
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
    throw new Error("Invalid token JSON");
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

module.exports = {
  base64urlEncode,
  base64urlDecode,
  signHS256,
  parseCookies,
  JWT_SECRET,
  createJwt,
  verifyJwt,
};
