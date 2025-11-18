// api/admin.js
const { parseCookies, verifyJwt } = require("./_jwt");

module.exports = (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;
    if (!token) {
      res.statusCode = 401;
      return res.json({ message: "Not logged in" });
    }

    const user = verifyJwt(token);

    // THE IMPORTANT PART: check only user.role
    if (String(user.role || "").toLowerCase() === "admin") {
      res.statusCode = 200;
      return res.json({
        message: `Admin session accepted for ${user.sub}.`,
        flag: "CH{jwt_role_admin_cyberhawks_bank}",
      });
    }

    res.statusCode = 403;
    return res.json({
      message: `Your current role is "${user.role}". Only role "admin" may access this console.`,
    });
  } catch (e) {
    res.statusCode = 401;
    return res.json({ message: "Invalid or missing JWT" });
  }
};
