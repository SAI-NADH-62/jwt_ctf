// api/signup.js
const { createJwt } = require("./_jwt");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ message: "Method not allowed" });
  }

  const { name, username, password } = req.body || {};

  if (!name || !username || !password) {
    res.statusCode = 400;
    return res.json({ message: "All fields are required" });
  }

  const uname = String(username).trim();

  // Block direct admin signup
  if (["admin", "administrator", "ceo"].includes(uname.toLowerCase())) {
    res.statusCode = 403;
    return res.json({
      message:
        "Admin accounts cannot be created via self-service. Create a normal customer and try exploring the JWT.",
    });
  }

  const token = createJwt(uname);

  const cookie = [
    `session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    // "Secure", // enable when using HTTPS
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
  res.statusCode = 200;
  return res.json({ message: "Account created", username: uname });
};
