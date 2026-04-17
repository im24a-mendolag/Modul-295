const users = require('../users.json')

function findUser(email, password) {
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) { return null }
  const { password: _pw, ...safeUser } = user
  return safeUser
}

module.exports = { findUser }
