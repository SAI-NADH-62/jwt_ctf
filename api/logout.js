// api/logout.js
const { createSessionCookie } = require("./_jwt");
const { sendError, sendSuccess } = require("./_response");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  // Use shared cookie utility with Max-Age=0 to delete
  res.setHeader("Set-Cookie", createSessionCookie("deleted", 0));
  return sendSuccess(res, { message: "Logged out" });
};
