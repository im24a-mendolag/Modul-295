function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next()
  }
  res.status(401).json({ error: 'Unauthorized – please log in first' })
}

module.exports = { requireAuth }
