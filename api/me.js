// api/me.js
const { parseCookies, verifyJwt } = require("./_jwt");

module.exports = (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie || "");
    const token = cookies.session;
    if (!token) {
      res.statusCode = 401;
      return res.json({ message: "No session" });
    }

    const payload = verifyJwt(token);
    res.statusCode = 200;
    return res.json({ user: payload });
  } catch (e) {
    res.statusCode = 401;
    return res.json({ message: "Invalid or expired session" });
  }
};
