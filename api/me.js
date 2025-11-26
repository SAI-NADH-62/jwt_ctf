// api/me.js
const { parseCookies, verifyJwt } = require("./_jwt");
const { sendError, sendSuccess } = require("./_response");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;

    if (!token) {
      return sendError(res, 401, "No session");
    }

    const payload = verifyJwt(token);
    return sendSuccess(res, { user: payload });
  } catch (e) {
    return sendError(res, 401, "Invalid or expired session");
  }
};
