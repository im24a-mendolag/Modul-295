const jwt = require("jsonwebtoken");
const { users, tokenBlacklist } = require("../data/store");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function login(req, res) {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "8h" });
  return res.status(200).json({ token });
}

function verify(req, res) {
  return res.status(200).json({ valid: true, user: req.user });
}

function logout(req, res) {
  tokenBlacklist.add(req.token);
  return res.status(200).json({ message: "Logged out successfully" });
}

module.exports = { login, verify, logout };
