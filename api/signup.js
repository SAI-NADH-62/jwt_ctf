// api/signup.js
const { createJwt, createSessionCookie } = require("./_jwt");
const { sendError, sendSuccess } = require("./_response");
const config = require("./_config");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  const { name, username, password } = req.body || {};

  if (!name || !username || !password) {
    return sendError(res, 400, "All fields are required");
  }

  // OPTIMIZED: Single toLowerCase call
  const uname = String(username).trim().toLowerCase();

  // Block direct admin signup
  if (config.BLOCKED_USERNAMES.includes(uname)) {
    return sendError(
      res,
      403,
      "Admin accounts cannot be created via self-service. Create a normal customer and try exploring the JWT."
    );
  }

  const token = createJwt(uname);

  // Use shared cookie utility
  res.setHeader("Set-Cookie", createSessionCookie(token));
  return sendSuccess(res, { message: "Account created", username: uname });
};
