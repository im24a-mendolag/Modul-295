const users = [
  { id: "1", username: "admin", password: "password123" },
];

const tasks = [];

const tokenBlacklist = new Set();

module.exports = { users, tasks, tokenBlacklist };
