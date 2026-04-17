const express = require("express");
const ctrl = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

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
router.post("/login", ctrl.login);

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
router.get("/verify", requireAuth, ctrl.verify);

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
router.delete("/logout", requireAuth, ctrl.logout);

module.exports = router;
