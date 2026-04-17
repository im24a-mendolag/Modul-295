const jwt = require("jsonwebtoken");
const { tokenBlacklist } = require("../data/store");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: "Token has been invalidated" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
