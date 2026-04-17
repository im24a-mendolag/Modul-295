const express = require('express')
const session = require('express-session')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const authRoutes = require('./routes/authRoutes')
const bookRoutes = require('./routes/bookRoutes')
const lendRoutes = require('./routes/lendRoutes')

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('.'))

app.use(session({
  secret: 'library-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}))

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use('/', authRoutes)
app.use('/books', bookRoutes)
app.use('/lends', lendRoutes)

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
  console.log(`Swagger UI:  http://localhost:${port}/swagger-ui/`)
  console.log(`Login form:  http://localhost:${port}/login.html`)
})
