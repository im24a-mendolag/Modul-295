const express = require('express');
const app = express();
const port = 3000;

const user = 'zli'
const password = 'zli1234'

const credentials = `${user}:${password}`;
const encoded = Buffer.from(credentials).toString('base64');


app.use(express.json());

app.get('/private', (request, response) => {
  const auth = request.headers['authorization'];
  if (auth === `Basic ${encoded}`) {
    response.status(200).send('Access granted');
  } else {
    response.status(401).send('Unauthorized');
  }
});

app.get('/public', (request, response) => {
    response.status(200).send('Access granted');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
