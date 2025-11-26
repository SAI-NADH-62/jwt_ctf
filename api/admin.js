// api/admin.js
const { parseCookies, verifyJwt } = require("./_jwt");
const { sendError, sendSuccess } = require("./_response");
const config = require("./_config");

module.exports = (req, res) => {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;

    if (!token) {
      return sendError(res, 401, "Not logged in");
    }

    const user = verifyJwt(token);

    // THE IMPORTANT PART: check only user.role (VULNERABLE - KEEP FOR CTF)
    if (String(user.role || "").toLowerCase() === config.ROLES.ADMIN) {
      return sendSuccess(res, {
        message: `Admin session accepted for ${user.sub}.`,
        flag: "CHCTF{B43Ach3D_4DmIn_Cyb3rH4wkS_B4nK}",
      });
    }

    return sendError(
      res,
      403,
      `Your current role is "${user.role}". Only role "admin" may access this console.`
    );
  } catch (e) {
    return sendError(res, 401, "Invalid or missing JWT");
  }
};
