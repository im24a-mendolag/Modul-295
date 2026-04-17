const express = require("express");
const jwt = require("jsonwebtoken");
const { users, tokenBlacklist } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login with credentials
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "8h",
  });

  return res.status(200).json({ token });
});

/**
 * @openapi
 * /verify:
 *   get:
 *     summary: Verify token validity
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token is invalid or missing
 */
router.get("/verify", requireAuth, (req, res) => {
  return res.status(200).json({ valid: true, user: req.user });
});

/**
 * @openapi
 * /logout:
 *   delete:
 *     summary: Invalidate the current token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Token missing or already invalid
 */
router.delete("/logout", requireAuth, (req, res) => {
  tokenBlacklist.add(req.token);
  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
