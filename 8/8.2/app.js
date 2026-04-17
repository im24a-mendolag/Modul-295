const express = require('express')

const app = express()
const PORT = 3000

app.use(express.json())

// ── Middleware 1: Logger ───────────────────────────────────────────────────────
// Logs method, URL and timestamp for every incoming request.

function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
}

// ── Middleware 2: Auth header check ───────────────────────────────────────────
// Requires X-Auth-Token header to be present, otherwise returns 401.

function requireAuthToken(req, res, next) {
  if (!req.headers['x-auth-token']) {
    return res.status(401).json({ error: 'Missing X-Auth-Token header' })
  }
  next()
}

// ── Middleware 3: Simulated delay ─────────────────────────────────────────────
// Waits 2 seconds before passing the request to the next handler.

function delay(req, res, next) {
  setTimeout(next, 2000)
}

// ── Middleware 4: Response time ───────────────────────────────────────────────
// Records when the request started and logs the elapsed time once the
// response finishes. Must be registered before the other middlewares so
// the timer starts as early as possible.

function responseTime(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[response-time] ${req.method} ${req.url} — ${Date.now() - start}ms`)
  })
  next()
}

// ── Register global middlewares ───────────────────────────────────────────────

app.use(responseTime)   // start timer first
app.use(logger)
app.use(requireAuthToken)
app.use(delay)

// ── Endpoints ─────────────────────────────────────────────────────────────────

// GET /ping — returns a simple pong response
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// POST /echo — returns whatever JSON body was sent
app.post('/echo', (req, res) => {
  res.json({ echo: req.body })
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log('Try:')
  console.log(`  curl http://localhost:${PORT}/ping -H "X-Auth-Token: secret"`)
  console.log(`  curl -X POST http://localhost:${PORT}/echo -H "X-Auth-Token: secret" -H "Content-Type: application/json" -d '{"hello":"world"}'`)
})
