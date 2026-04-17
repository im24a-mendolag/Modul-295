const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(express.json());
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// POST /name - save name in session
app.post('/name', (request, response) => {
  const { name } = request.body;
  if (!name) return response.status(422).json({ error: 'name is required' });
  request.session.name = name;
  response.json({ name: request.session.name });
});

// GET /name - get name from session
app.get('/name', (request, response) => {
  if (!request.session.name) return response.status(404).json({ error: 'No name in session' });
  response.json({ name: request.session.name });
});

// DELETE /name - remove name from session
app.delete('/name', (request, response) => {
  if (!request.session.name) return response.status(404).json({ error: 'No name in session' });
  delete request.session.name;
  response.json({ message: 'Name deleted from session' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
