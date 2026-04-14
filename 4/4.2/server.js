const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let names = ['Aaron', 'Ennio', 'Giovanni', 'Dario', 'Paul', 'Andris', 'Michael', 'Goncalo', 'Nicola', 'Felix', 'Arbi', 'Flavio', 'Samuel', 'Sanjay', 'Alex', 'Elio', 'Rachel', 'Sam', 'Tina', 'Leo'];

let me = {
  vorname: 'Giovanni',
  nachname: 'Mendola',
  alter: 18,
  wohnort: 'Zürich',
  augenfarbe: 'braun'
};

// GET /now?tz=Europe/Zurich
app.get('/now', (request, response) => {
  const tz = request.query.tz || 'UTC';
  const time = new Date().toLocaleTimeString('de-CH', { timeZone: tz });
  response.type('text').send(time);
});

// GET /name
app.get('/name', async (request, response) => {
  response.set('Content-Type', 'text/plain')
  response.send(names[Math.floor(Math.random() * names.length)]);
});

// POST /names (form body: name=...)
app.post('/names', (request, response) => {
  const name = request.body.name;
  names.push(name);
  response.status(201).json(names);
});

// DELETE /names?name=...
app.delete('/names', (req, res) => {
  const nameToDelete = req.query.name;
  if (!nameToDelete) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }
  const index = names.findIndex(n => n.toLowerCase() === nameToDelete.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: `name "${nameToDelete}" was not found` });
  }
  names.splice(index, 1);
  res.status(204).send();
});

// GET /secret2
app.get('/secret2', (request, response) => {
  const auth = request.headers['authorization'];
  if (auth === 'Basic aGFja2VyOjEyMzQ=') {
    response.status(200).send('Access granted');
  } else {
    response.status(401).send('Unauthorized');
  }
});

// GET /chuck?name=...
app.get('/chuck', async (request, response) => {
  const name = request.query.name || 'Chuck Norris';
  const res = await fetch('https://api.chucknorris.io/jokes/random');
  const data = await res.json();
  const joke = data.value.replace(/Chuck Norris/g, name);
  response.type('text').send(joke);
});

// GET /me
app.get('/me', (request, response) => {
  response.json(me);
});

// PATCH /me
app.patch('/me', (request, response) => {
  me = { ...me, ...request.body };
  response.json(me);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
