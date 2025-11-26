// api/login.js
const { createJwt, createSessionCookie } = require("./_jwt");
const { sendError, sendSuccess } = require("./_response");
const config = require("./_config");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return sendError(res, 400, "Username and password required");
  }

  // OPTIMIZED: Single toLowerCase call
  const uname = String(username).trim().toLowerCase();

  if (config.BLOCKED_USERNAMES.includes(uname)) {
    return sendError(
      res,
      403,
      "Direct admin login is disabled in this training portal. Please sign in as a normal customer."
    );
  }

  const token = createJwt(uname);

  // Use shared cookie utility
  res.setHeader("Set-Cookie", createSessionCookie(token));
  return sendSuccess(res, { message: "Logged in", username: uname });
};
