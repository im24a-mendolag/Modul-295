const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

function csvToJson(path) {
    const arr = fs.readFileSync(path, 'utf-8').trim().split('\n').map(place => {return place.split(';');});
    const keys = arr[0]
    const pairs = arr.slice(1,-1).map(entry => entry.map((value,index) => value = [keys[index],value]))
    return pairs.map(entry => Object.fromEntries(entry))
}

const plzArr = csvToJson('3/3.2/AMTOVZ_CSV_LV95.csv')
const names = ['Aaron', 'Ennio', 'Giovanni', 'Dario', 'Paul', 'Andris', 'Michael', 'Goncalo', 'Nicola', 'Felix', 'Arbi', 'Flavio', 'Samuel', 'Paul', 'Sanjay', 'Alex', 'Elio', 'Rachel', 'Sam', 'Tina'];

function findZipIDByName(arr, name) {
    return arr[arr.findIndex(place => place.Ortschaftsname === name)].PLZ4;
};

async function getWeather(zip) {
  const url = `https://app-prod-ws.meteoswiss-app.ch/v1/plzDetail?plz=${zip}00`;

  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      console.error(response.status);
    }
    else {
      const data = await response.json();
      console.log(data);
      return data;
    }
  } catch(error) {
    console.error(error);
  }
}

app.get('/weather/:location', async (request, response) => {
  response.send(await getWeather(findZipIDByName(plzArr, request.params.location)));
});

app.get('/now', async (request, response) => {
  response.set('Content-Type', 'text/plain')
  const now = new Date()
  const res = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`
  response.send(res);
});

app.get('/zli', async (request, response) => {
  response.redirect('https://moodle.zli.ch/');
});

app.get('/name', async (request, response) => {
  response.set('Content-Type', 'text/plain')
  response.send(names[Math.floor(Math.random() * names.length)]);
});

app.get('/html', async (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/image', async (request, response) => {
  response.set('Content-Type', 'image/png')
  response.sendFile(path.join(__dirname, 'image.png'));
});

app.get('/teapot', async (request, response) => {
  response.status(418).send('I am a teapot');
});

app.get('/me', (request, response) => {
  response.json({
    vorname: 'Giovanni',
    nachname: 'Mendola',
    alter: 18,
    wohnort: 'Zürich',
    augenfarbe: 'braun'
  });
});

app.get('/user-agent', (request, response) => {
  response.type('text').send(request.headers['user-agent']);
});

app.get('/secret', (request, response) => {
  response.status(403).send('Forbidden');
});

app.get('/xml', (request, response) => {
  response.type('application/xml').sendFile(path.join(__dirname, 'data.xml'));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
