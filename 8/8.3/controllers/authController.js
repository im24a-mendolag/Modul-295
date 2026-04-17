const { findUser } = require('../models/userModel')

function login(req, res) {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Log in with email and password'
    #swagger.parameters['body'] = {
      in: 'body', required: true,
      schema: { email: 'desk@library.example', password: 'm295' }
    }
    #swagger.responses[201] = { description: 'Login successful, returns email' }
    #swagger.responses[401] = { description: 'Invalid credentials' }
  */
  const { email, password } = req.body
  const user = findUser(email, password)

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  req.session.authenticated = true
  req.session.email = user.email
  res.status(201).json({ email: user.email })
}

function verify(req, res) {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Verify if the current session is authenticated'
    #swagger.responses[200] = { description: 'Authenticated – returns email' }
    #swagger.responses[401] = { description: 'Not authenticated' }
  */
  if (req.session.authenticated) {
    return res.status(200).json({ email: req.session.email })
  }
  res.status(401).json({ error: 'Not authenticated' })
}

function logout(req, res) {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Log out – destroys the current session'
    #swagger.responses[204] = { description: 'Logged out successfully' }
  */
  req.session.destroy(() => {
    res.status(204).send()
  })
}

module.exports = { login, verify, logout }
