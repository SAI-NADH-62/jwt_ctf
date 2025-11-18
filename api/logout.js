// api/logout.js
module.exports = (req, res) => {
  const cookie = [
    "session=deleted",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    // "Secure",
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
  res.statusCode = 200;
  return res.json({ message: "Logged out" });
};
