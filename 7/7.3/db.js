/**
 * Simulates a database layer for user accounts.
 * In production this would query a real database (e.g. PostgreSQL, SQLite).
 * Data is loaded once from users.json at startup.
 */
const users = require('./users.json');

/**
 * Find a user by email and password.
 * Returns the user object (without password) or null if not found.
 */
function findUser(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return null;
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

module.exports = { findUser };
