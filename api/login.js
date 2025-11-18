// api/login.js
const { createJwt } = require("./_jwt");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ message: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    res.statusCode = 400;
    return res.json({ message: "Username and password required" });
  }

  const uname = String(username).trim();

  if (["admin", "administrator", "ceo"].includes(uname.toLowerCase())) {
    res.statusCode = 403;
    return res.json({
      message:
        "Direct admin login is disabled in this training portal. Please sign in as a normal customer.",
    });
  }

  const token = createJwt(uname);

  const cookie = [
    `session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    // "Secure",
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
  res.statusCode = 200;
  return res.json({ message: "Logged in", username: uname });
};
