# Backend-Entwicklung mit Node.js & Express – Prüfungsvorbereitung

Diese Zusammenfassung deckt alle Themen aus den 21 Aufgaben ab und bereitet dich auf Theoriefragen, eigenes Programmieren ohne Hilfsmittel und Fragen zum Abschlussprojekt vor.

---

## Inhaltsverzeichnis

1. [Node.js Grundlagen](#1-nodejs-grundlagen)
2. [Asynchrone Programmierung](#2-asynchrone-programmierung)
3. [Array-Funktionen](#3-array-funktionen)
4. [HTTP & REST Grundlagen](#4-http--rest-grundlagen)
5. [Express.js](#5-expressjs)
6. [REST APIs bauen](#6-rest-apis-bauen)
7. [OpenAPI & Swagger](#7-openapi--swagger)
8. [API Testing](#8-api-testing)
9. [Authentifizierung](#9-authentifizierung)
10. [Sessions](#10-sessions)
11. [Code-Qualität: Linting & Struktur](#11-code-qualität-linting--struktur)
12. [Abschlussprojekt: Task-API](#12-abschlussprojekt-task-api)
13. [Typische Prüfungsfragen](#13-typische-prüfungsfragen)

---

## 1. Node.js Grundlagen

### Was ist Node.js?

Node.js ist eine **JavaScript-Laufzeitumgebung** basierend auf der V8-Engine von Chrome. Damit kann JavaScript ausserhalb des Browsers ausgeführt werden – typischerweise auf dem Server. Node.js ist **single-threaded**, **event-driven** und **non-blocking** (asynchron).

### Kernkonzepte

- **Event Loop**: Verarbeitet asynchrone Operationen. Callbacks werden in die Queue gestellt und nacheinander abgearbeitet.
- **Module-System**: CommonJS (`require`) oder ES Modules (`import`). Heute wird ES Modules bevorzugt (`"type": "module"` in `package.json`).
- **npm**: Package Manager. `npm install <paket>` installiert Pakete. `-g` für global, `--save-dev` für Entwicklungsabhängigkeiten.
- **package.json**: Beschreibt das Projekt, Dependencies, Scripts.

### Wichtige eingebaute Module

```js
import fs from 'node:fs/promises';     // Dateisystem
import http from 'node:http';          // HTTP Server/Client
import path from 'node:path';          // Pfade
import url from 'node:url';            // URL-Parsing
```

### Beispiele aus learnyounode

**Synchroner Dateizugriff (MY FIRST I/O):**
```js
import fs from 'node:fs';
const content = fs.readFileSync(process.argv[2], 'utf8');
console.log(content.split('\n').length - 1);
```

**Asynchroner Dateizugriff (MY FIRST ASYNC I/O):**
```js
import fs from 'node:fs';
fs.readFile(process.argv[2], 'utf8', (err, data) => {
  if (err) return console.error(err);
  console.log(data.split('\n').length - 1);
});
```

**HTTP Client (HTTP CLIENT):**
```js
import http from 'node:http';
http.get(process.argv[2], (response) => {
  response.setEncoding('utf8');
  response.on('data', console.log);
  response.on('error', console.error);
});
```

**Time Server (TCP Server):**
```js
import net from 'node:net';
const server = net.createServer((socket) => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  socket.end(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}\n`);
});
server.listen(Number(process.argv[2]));
```

---

## 2. Asynchrone Programmierung

Dies ist das **Herzstück** von Node.js. Drei Paradigmen musst du beherrschen: **Callbacks**, **Promises**, **async/await**.

### 2.1 Callbacks

Eine Funktion wird als Argument übergeben und später aufgerufen.

```js
function double(value, callback) {
  const result = value * 2;
  callback(result);
}

double(5, (result) => {
  console.log('Das Ergebnis ist:', result); // 10
});
```

**Problem**: Callback Hell (tief verschachtelte Callbacks).

### 2.2 Promises

Ein Promise ist ein Objekt, das einen zukünftigen Wert repräsentiert. Zustände: **pending**, **fulfilled**, **rejected**.

```js
import fs from 'node:fs/promises';

function readFileContent(filepath) {
  return fs.readFile(filepath, 'utf8'); // Gibt ein Promise zurück
}

readFileContent('beispiel.txt')
  .then(content => console.log('Länge:', content.length))
  .catch(err => console.error('Fehler:', err));
```

**Chainable-Methoden**: `.then()`, `.catch()`, `.finally()`.

### 2.3 async/await

Syntaktischer Zucker über Promises. Macht asynchronen Code wie synchronen lesbar.

```js
async function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAfterDelay(a, b, ms) {
  await simulateDelay(ms);
  const result = a + b;
  console.log('Das Ergebnis ist:', result);
}

addAfterDelay(3, 7, 2000); // Nach 2s: "Das Ergebnis ist: 10"
```

### 2.4 Fetch mit verschiedenen Mustern

**Promise-Style:**
```js
fetch('https://httpbin.org/status/403', { method: 'DELETE' })
  .then(response => {
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return response;
  })
  .catch(err => console.error(err.message))
  .finally(() => console.log('Anfrage abgeschlossen'));
```

**async/await-Style:**
```js
async function request() {
  try {
    const response = await fetch('https://httpbin.org/status/403', { method: 'DELETE' });
    if (!response.ok) throw new Error(`Status ${response.status}`);
  } catch (err) {
    console.error(err.message);
  } finally {
    console.log('Anfrage abgeschlossen');
  }
}
```

**Promise.all (parallele Anfragen):**
```js
const urls = [1, 2, 3].map(n => `https://httpbin.org/delay/${n}`);
const responses = await Promise.all(urls.map(url => fetch(url)));
const data = await Promise.all(responses.map(r => r.json()));
console.log(data);
```

**Retry-Mechanismus:**
```js
async function fetchWithRetry(url, retries) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return response;
    } catch (err) {
      console.log(`Versuch ${i + 1} fehlgeschlagen: ${err.message}`);
      if (i === retries) throw err;
    }
  }
}
```

### 2.5 Juggling Async (learnyounode)

Mehrere HTTP-Requests parallel, Antworten **in Reihenfolge** ausgeben:

```js
import http from 'node:http';
const urls = process.argv.slice(2);
const results = [];
let completed = 0;

urls.forEach((url, i) => {
  http.get(url, (res) => {
    let data = '';
    res.setEncoding('utf8');
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      results[i] = data;
      completed++;
      if (completed === urls.length) {
        results.forEach(r => console.log(r));
      }
    });
  });
});
```

---

## 3. Array-Funktionen

Zentrale funktionale Methoden:

| Methode | Rückgabe | Zweck |
|---------|----------|-------|
| `map` | Neues Array | Transformieren |
| `filter` | Neues Array | Filtern nach Bedingung |
| `reduce` | Einzelner Wert | Aggregieren |
| `find` | Element oder undefined | Erstes passendes Element |
| `findIndex` | Index oder -1 | Index des ersten passenden Elements |
| `some` | Boolean | Mindestens eines erfüllt |
| `every` | Boolean | Alle erfüllen |
| `flatMap` | Neues Array | Map + flach machen |
| `forEach` | undefined | Iteration mit Seiteneffekt |
| `sort` | Array (mutiert!) | Sortieren |

### Beispiele mit `scheduledTasks` (Garage)

```js
// 1. Filter: Ölwechsel für BMW
const bmwOilChanges = tasks.filter(t => t.brand === 'BMW' && t.serviceType === 'Ölwechsel');

// 2. Durchschnittliche Wartezeit
const avg = tasks.reduce((sum, t) => sum + t.duration, 0) / tasks.length;

// 3. Gibt es dringende Aufträge?
const hasUrgent = tasks.some(t => t.urgent);

// 4. Sind alle Wartezeiten < 10h?
const allUnder10 = tasks.every(t => t.duration < 10);

// 5. Erster Lamborghini-Reparaturauftrag
const firstLambo = tasks.find(t => t.brand === 'Lamborghini' && t.serviceType === 'Reparatur');

// 6. Index des längsten Wartens
const maxDuration = Math.max(...tasks.map(t => t.duration));
const idx = tasks.findIndex(t => t.duration === maxDuration);

// 7. Namen aller Ölwechsel-Kunden
const customers = tasks
  .filter(t => t.serviceType === 'Ölwechsel')
  .map(t => t.customer);

// 8. Anzahl Aufträge pro Marke
const byBrand = tasks.reduce((acc, t) => {
  acc[t.brand] = (acc[t.brand] || 0) + 1;
  return acc;
}, {});

// 9. Sonderanfragen loggen
tasks
  .filter(t => ['Lackieren', 'Tieferlegen'].includes(t.serviceType))
  .forEach(t => console.log(`${t.customer}: ${t.serviceType}`));

// 10. Alle Ersatzteile flach
const allParts = tasks.flatMap(t => t.parts);
```

---

## 4. HTTP & REST Grundlagen

### HTTP Verben

| Verb | Zweck | Idempotent? |
|------|-------|-------------|
| GET | Daten abrufen | Ja |
| POST | Ressource erstellen | Nein |
| PUT | Ressource ersetzen | Ja |
| PATCH | Ressource teilweise ändern | Nein (meist) |
| DELETE | Ressource löschen | Ja |

**Idempotent** heisst: mehrfache Ausführung hat denselben Effekt wie einmalige Ausführung.

### HTTP Status Codes (wichtig für die Prüfung!)

**2xx Erfolg:**
- `200 OK` – Erfolg (GET, PUT, PATCH)
- `201 Created` – Ressource erstellt (POST)
- `204 No Content` – Erfolg ohne Body (DELETE, Logout)

**3xx Redirect:**
- `301 Moved Permanently` – Dauerhafte Weiterleitung
- `302 Found` – Temporäre Weiterleitung

**4xx Client-Fehler:**
- `400 Bad Request` – Anfrage fehlerhaft
- `401 Unauthorized` – Authentifizierung fehlt
- `403 Forbidden` – Keine Berechtigung
- `404 Not Found` – Ressource existiert nicht
- `409 Conflict` – Konflikt (z. B. Buch schon ausgeliehen)
- `418 I'm a teapot` – (Humor, aber echter Code)
- `422 Unprocessable Entity` – Validierungsfehler

**5xx Server-Fehler:**
- `500 Internal Server Error` – Genereller Serverfehler

### Content-Type Header

- `application/json` – JSON-Daten
- `text/html` – HTML
- `text/plain` – Klartext
- `application/xml` – XML
- `image/png`, `image/jpeg` – Bilder
- `application/x-www-form-urlencoded` – Formular-Daten

### REST-Prinzipien

1. **Ressourcenorientiert**: URLs beschreiben Dinge (`/books`), keine Aktionen (`/getBooks`).
2. **Stateless**: Server speichert keinen Client-Zustand zwischen Requests (ausser Session-Cookie für Auth).
3. **Einheitliche Schnittstelle**: Standardisierte HTTP-Verben.
4. **Verschachtelte Ressourcen**: `/books/{isbn}/lends` für Ausleihen eines Buches.

### REST API Designregeln

- Substantive im **Plural**: `/books`, nicht `/book`
- IDs im Pfad: `/books/{isbn}`
- Unterrelationen: `/books/{isbn}/reviews`
- Queryparameter für Filter/Sortierung: `/books?author=Goethe&sort=year`

---

## 5. Express.js

Express ist das beliebteste Web-Framework für Node.js. Es vereinfacht Routing, Middleware und Request/Response-Handling.

### Installation und Setup

```bash
npm init -y
npm install express
```

In `package.json`: `"type": "module"` für ES Modules.

### Hello World

```js
import express from 'express';
const app = express();
const port = 3000;

app.use(express.json()); // Body-Parser für JSON

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
```

### Request-Objekt (`req`)

- `req.params` – Pfadparameter (z. B. `/users/:id` → `req.params.id`)
- `req.query` – Query-Parameter (`?name=Paul` → `req.query.name`)
- `req.body` – Request-Body (benötigt `express.json()`)
- `req.headers` – HTTP Header (z. B. `req.headers['user-agent']`)
- `req.method` – HTTP-Methode
- `req.url` – URL-Pfad

### Response-Objekt (`res`)

- `res.send(body)` – Sendet Antwort (Content-Type automatisch)
- `res.json(obj)` – Sendet JSON
- `res.status(code)` – Setzt Status Code (chainable)
- `res.set(header, value)` – Setzt Header
- `res.redirect(url)` – Weiterleitung (Status 302)
- `res.sendFile(path)` – Sendet Datei
- `res.end()` – Beendet Antwort ohne Body
- `res.sendStatus(code)` – Status + Standardtext

### Beispiel-Endpunkte

```js
// /now mit Zeitzone
app.get('/now', (req, res) => {
  const tz = req.query.tz || 'Europe/Zurich';
  res.send(new Date().toLocaleString('de-CH', { timeZone: tz }));
});

// /zli Redirect
app.get('/zli', (req, res) => {
  res.redirect('https://www.zli.ch');
});

// /name zufälliger Name
const names = ['Anna', 'Ben', 'Carla', /* ... */];
app.get('/name', (req, res) => {
  const random = names[Math.floor(Math.random() * names.length)];
  res.send(random);
});

// /html statische Datei
import path from 'node:path';
app.get('/html', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

// /teapot
app.get('/teapot', (req, res) => {
  res.status(418).send("I'm a teapot");
});

// /user-agent
app.get('/user-agent', (req, res) => {
  res.send(req.headers['user-agent']);
});

// /me JSON
app.get('/me', (req, res) => {
  res.json({
    firstName: 'Paul',
    lastName: 'Kühn',
    age: 17,
    city: 'Zürich',
    eyeColor: 'blau'
  });
});

// POST /names hinzufügen
app.post('/names', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(422).json({ error: 'Name erforderlich' });
  names.push(name);
  res.status(201).json({ name });
});

// DELETE /names entfernen
app.delete('/names', (req, res) => {
  const { name } = req.query;
  const idx = names.indexOf(name);
  if (idx === -1) return res.sendStatus(404);
  names.splice(idx, 1);
  res.sendStatus(204);
});

// PATCH /me teilweise updaten
let me = { firstName: 'Paul', age: 17 };
app.patch('/me', (req, res) => {
  me = { ...me, ...req.body };
  res.json(me);
});
```

### Middleware

Funktionen, die zwischen Request und Response ausgeführt werden. Signatur: `(req, res, next) => {}`.

```js
// Eigene Logger-Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // WICHTIG: next() aufrufen, sonst hängt die Anfrage
});

// Auth-Middleware
function requireAuth(req, res, next) {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  next();
}

app.get('/private', requireAuth, (req, res) => {
  res.json({ secret: 42 });
});
```

**Eingebaute Middleware:**
- `express.json()` – Parst JSON-Body
- `express.urlencoded({ extended: true })` – Parst Form-Daten
- `express.static('public')` – Bedient statische Dateien

---

## 6. REST APIs bauen

### Bibliothek: `Book` Ressource

```js
import express from 'express';
const app = express();
app.use(express.json());

let books = [
  { isbn: '978-3-16-148410-0', title: 'Faust', year: 1808, author: 'Goethe' }
];

// GET alle
app.get('/books', (req, res) => res.json(books));

// GET einzeln
app.get('/books/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.sendStatus(404);
  res.json(book);
});

// POST neu
app.post('/books', (req, res) => {
  const { isbn, title, year, author } = req.body;
  if (!isbn || !title || !year || !author) {
    return res.status(422).json({ error: 'Alle Felder erforderlich' });
  }
  const book = { isbn, title, year, author };
  books.push(book);
  res.status(201).json(book);
});

// PUT ersetzen
app.put('/books/:isbn', (req, res) => {
  const { title, year, author } = req.body;
  if (!title || !year || !author) return res.sendStatus(422);
  const idx = books.findIndex(b => b.isbn === req.params.isbn);
  if (idx === -1) return res.sendStatus(404);
  books[idx] = { isbn: req.params.isbn, title, year, author };
  res.json(books[idx]);
});

// PATCH teilweise
app.patch('/books/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.sendStatus(404);
  Object.assign(book, req.body);
  // Validierung auf leere Felder
  if (!book.title || !book.author) return res.sendStatus(422);
  res.json(book);
});

// DELETE
app.delete('/books/:isbn', (req, res) => {
  const idx = books.findIndex(b => b.isbn === req.params.isbn);
  if (idx === -1) return res.sendStatus(404);
  books.splice(idx, 1);
  res.sendStatus(204);
});
```

### Bibliothek: `Lend` Ressource mit Validierung

```js
import { randomUUID } from 'node:crypto';
let lends = [];

app.post('/lends', (req, res) => {
  const { customerId, isbn } = req.body;
  
  // 1. Pflichtfelder
  if (!customerId || !isbn) return res.status(422).json({ error: 'customerId und isbn erforderlich' });
  
  // 2. Buch existiert?
  if (!books.find(b => b.isbn === isbn)) return res.status(404).json({ error: 'Buch nicht gefunden' });
  
  // 3. Bereits ausgeliehen?
  const activeLend = lends.find(l => l.isbn === isbn && !l.returnedAt);
  if (activeLend) return res.status(409).json({ error: 'Buch bereits ausgeliehen' });
  
  // 4. Max. 3 offene Ausleihen pro Kunde
  const open = lends.filter(l => l.customerId === customerId && !l.returnedAt).length;
  if (open >= 3) return res.status(403).json({ error: 'Maximale Ausleihen erreicht' });
  
  const lend = {
    id: randomUUID(),
    customerId,
    isbn,
    borrowedAt: new Date().toISOString(),
    returnedAt: null
  };
  lends.push(lend);
  res.status(201).json(lend);
});

app.delete('/lends/:id', (req, res) => {
  const lend = lends.find(l => l.id === req.params.id);
  if (!lend) return res.sendStatus(404);
  lend.returnedAt = new Date().toISOString();
  res.json(lend);
});
```

### REST API Spezifikations-Analyse (Aufgabe 13)

Am Beispiel der **Petstore API**:

1. **Wichtigste Ressourcen**: `Pet`, `Store` (Order), `User`.
2. **Properties eines Pets**:
   ```json
   {
     "id": 10,
     "name": "doggie",
     "category": { "id": 1, "name": "Dogs" },
     "photoUrls": ["url1"],
     "tags": [{ "id": 0, "name": "tag1" }],
     "status": "available"
   }
   ```
3. **Einzelnes Pet abholen**: `GET /pet/{petId}`
4. **Wissenswertes**: Authentifizierung via API Key im Header; OpenAPI 3.0 Spezifikation; auch XML-Support.

---

## 7. OpenAPI & Swagger

### Was ist OpenAPI?

**OpenAPI** (früher Swagger) ist ein **Standard zur Beschreibung von REST APIs**. Die Spezifikation ist eine JSON- oder YAML-Datei, die Endpunkte, Parameter, Status Codes, Datentypen etc. dokumentiert.

### Warum?

- Automatisch generierbare **Dokumentation** (Swagger UI)
- **Client-Code** kann generiert werden
- **Tests** können aus Spezifikation generiert werden
- Klare **Vertrag** zwischen Frontend und Backend

### Aufbau einer swagger.json

```json
{
  "openapi": "3.0.0",
  "info": { "title": "Bibliothek API", "version": "1.0.0" },
  "paths": {
    "/books": {
      "get": {
        "tags": ["Books"],
        "summary": "Liste aller Bücher",
        "responses": {
          "200": { "description": "Erfolg" }
        }
      }
    }
  }
}
```

### Integration mit Express

```bash
npm install swagger-autogen swagger-ui-express
```

**`swagger.js` (Generator-Script):**
```js
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'Bibliothek API', version: '1.0.0' },
  host: 'localhost:3000',
  tags: [
    { name: 'Books', description: 'Buchverwaltung' },
    { name: 'Lends', description: 'Ausleihen' }
  ]
};

swaggerAutogen()('./swagger.json', ['./index.js'], doc);
```

**In `index.js`:**
```js
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger.json' assert { type: 'json' };

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerFile));
```

**In Endpunkten mit Kommentaren:**
```js
app.get('/books', (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.summary = 'Liste aller Bücher'
  // #swagger.responses[200] = { description: 'Erfolg' }
  res.json(books);
});
```

---

## 8. API Testing

### API Clients

**Hoppscotch** (Web) und **Postman** (Desktop): Tools zum Testen von HTTP-Anfragen ohne Code.

**Was können sie:**
- Anfragen mit beliebigen Methoden, Headers, Body senden
- Antworten inspizieren (Body, Header, Status)
- Anfragen als **Collections** speichern
- Umgebungsvariablen (z. B. `{{baseUrl}}`)
- **Automatisierte Tests** mit JavaScript

### Beispiel-Tests in Hoppscotch

```js
// Status prüfen
pw.test("Status 200", () => {
  pw.expect(pw.response.status).toBe(200);
});

// JSON-Inhalt prüfen
pw.test("Body enthält Titel", () => {
  pw.expect(pw.response.body.title).toBe("Faust");
});

// Array-Länge
pw.test("Mindestens ein Buch", () => {
  pw.expect(pw.response.body.length).toBeGreaterThan(0);
});
```

### Pflichttests für Bibliothek

1. **Schönwettertests** für jeden Endpunkt (GET, POST, PUT, PATCH, DELETE bei Book und Lend)
2. **Buch ohne Titel** → Status 422
3. **Lend auf nicht-existierendes Buch** → Status 404
4. **Doppelte Ausleihe** → Status 409

---

## 9. Authentifizierung

### HTTP Basic Authentication

Der Client sendet im Header `Authorization: Basic <base64(username:password)>`.

**Wichtig**: Base64 ist **keine Verschlüsselung**! Deshalb nur über HTTPS einsetzen.

```js
app.get('/private', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic');
    return res.sendStatus(401);
  }
  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  if (user === 'zli' && pass === 'zli1234') {
    return res.json({ secret: 'Willkommen' });
  }
  res.sendStatus(401);
});
```

**Credentials aus Umgebungsvariablen**:
```js
import 'dotenv/config';
const USER = process.env.AUTH_USER;
const PASS = process.env.AUTH_PASS;
```

### Sequenzdiagramm (Basic Auth)

```
Client                          Server
  |--- GET /private ------------->|
  |<--- 401 + WWW-Authenticate ---|
  |--- GET /private + Auth ------>|
  |<--- 200 OK + Body ------------|
```

---

## 10. Sessions

Eine **Session** speichert Zustand serverseitig und identifiziert den Client über eine Session-ID (meist im Cookie).

### express-session verwenden

```bash
npm install express-session
```

```js
import session from 'express-session';

app.use(session({
  secret: 'geheimes-passwort',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1h
}));

// Name speichern
app.post('/name', (req, res) => {
  req.session.name = req.body.name;
  res.sendStatus(204);
});

// Name lesen
app.get('/name', (req, res) => {
  res.json({ name: req.session.name || null });
});

// Name löschen
app.delete('/name', (req, res) => {
  delete req.session.name;
  res.sendStatus(204);
});
```

### Login / Logout für Bibliothek

```js
const VALID_USER = { email: 'desk@library.example', password: 'm295' };

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === VALID_USER.email && password === VALID_USER.password) {
    req.session.authenticated = true;
    req.session.email = email;
    return res.status(201).json({ email });
  }
  res.sendStatus(401);
});

app.get('/verify', (req, res) => {
  if (req.session.authenticated) {
    return res.json({ email: req.session.email });
  }
  res.sendStatus(401);
});

app.delete('/logout', (req, res) => {
  req.session.destroy(() => res.sendStatus(204));
});

// Middleware
function requireAuth(req, res, next) {
  if (!req.session.authenticated) return res.sendStatus(401);
  next();
}

app.get('/lends', requireAuth, (req, res) => { /* ... */ });
```

### Sequenzdiagramm (Login)

```
Client                              Server
  |--- POST /login (email, pw) ----->|
  |                                  |-- prüft Credentials
  |                                  |-- setzt req.session.authenticated = true
  |<-- 201 + Set-Cookie: sid=xyz ----|
  |                                  |
  |--- GET /lends + Cookie sid=xyz ->|
  |                                  |-- Session geladen, authenticated=true
  |<-- 200 + Daten ------------------|
```

---

## 11. Code-Qualität: Linting & Struktur

### ESLint

Ein **Linter** prüft Code auf Fehler und Stil-Probleme **ohne ihn auszuführen**.

**Installation & Konfiguration:**
```bash
npm init @eslint/config@latest
```

Erzeugt `eslint.config.js`. Ausführen: `npx eslint .`

**Standard JS Regeln** (beliebter Stil):
- 2 Spaces Einrückung
- Einfache Anführungszeichen
- Keine Semikolons (bei Standard JS)
- Leerzeichen nach Keywords

### Strukturierung (MVC)

**MVC** = **M**odel – **V**iew – **C**ontroller. Bei APIs gibt's meist keine View, nur **Model** und **Controller**.

**Ordnerstruktur:**
```
projekt/
├── index.js                 # Einstiegspunkt
├── package.json
├── routes/
│   ├── booksRoutes.js
│   └── lendsRoutes.js
├── controllers/
│   ├── booksController.js
│   └── lendsController.js
├── models/
│   ├── bookModel.js
│   └── lendModel.js
├── middleware/
│   └── authMiddleware.js
└── swagger.json
```

**models/bookModel.js:**
```js
let books = [];

export function getAll() { return books; }
export function findByIsbn(isbn) { return books.find(b => b.isbn === isbn); }
export function add(book) { books.push(book); return book; }
export function update(isbn, data) {
  const b = findByIsbn(isbn);
  if (b) Object.assign(b, data);
  return b;
}
export function remove(isbn) {
  const idx = books.findIndex(b => b.isbn === isbn);
  if (idx !== -1) books.splice(idx, 1);
  return idx !== -1;
}
```

**controllers/booksController.js:**
```js
import * as Book from '../models/bookModel.js';

export function getAll(req, res) {
  res.json(Book.getAll());
}

export function create(req, res) {
  const { isbn, title, year, author } = req.body;
  if (!isbn || !title || !year || !author) return res.sendStatus(422);
  res.status(201).json(Book.add({ isbn, title, year, author }));
}
// ...
```

**routes/booksRoutes.js:**
```js
import { Router } from 'express';
import * as ctrl from '../controllers/booksController.js';

const router = Router();
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
// ...
export default router;
```

**middleware/authMiddleware.js:**
```js
export function requireAuth(req, res, next) {
  if (!req.session?.authenticated) return res.sendStatus(401);
  next();
}
```

**index.js:**
```js
import express from 'express';
import session from 'express-session';
import booksRoutes from './routes/booksRoutes.js';
import lendsRoutes from './routes/lendsRoutes.js';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();
app.use(express.json());
app.use(session({ secret: 'x', resave: false, saveUninitialized: false }));

app.use('/books', booksRoutes);
app.use('/lends', requireAuth, lendsRoutes);

app.listen(3000);
```

### Git & Conventional Commits

Gute Commit-Messages:
```
feat: add book deletion endpoint
fix: handle empty title in book validation
docs: update README with setup steps
refactor: extract book model from controller
test: add lend creation tests
chore: update dependencies
```

Format: `<type>(<scope>): <description>`

---

## 12. Abschlussprojekt: Task-API

### Ressource `task`

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | String | Auto-generiert (UUID) |
| title | String | Pflicht, nicht leer |
| description | String | Optional |
| createdAt | DateTime | Auto bei Erstellung |
| dueDate | DateTime | Optional |
| completedAt | DateTime | Auto bei Markierung als erledigt |

### Endpunkte

| Verb | Pfad | Status Codes |
|------|------|--------------|
| GET | /tasks | 200 |
| POST | /tasks | 201, 422 |
| GET | /tasks/:id | 200, 404 |
| PUT | /tasks/:id | 200, 404, 422 |
| DELETE | /tasks/:id | 204, 404 |
| POST | /tasks/:id/done | 200, 404 |
| POST | /login | 201, 401 |
| GET | /verify | 200, 401 |
| DELETE | /logout | 204 |

### Referenzimplementierung (vollständig)

**models/taskModel.js:**
```js
import { randomUUID } from 'node:crypto';
let tasks = [];

export const getAll = () => tasks;
export const findById = (id) => tasks.find(t => t.id === id);
export const create = ({ title, description, dueDate }) => {
  const task = {
    id: randomUUID(),
    title,
    description: description || null,
    createdAt: new Date().toISOString(),
    dueDate: dueDate || null,
    completedAt: null
  };
  tasks.push(task);
  return task;
};
export const replace = (id, data) => {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...data, id };
  return tasks[idx];
};
export const markDone = (id) => {
  const task = findById(id);
  if (!task) return null;
  task.completedAt = new Date().toISOString();
  return task;
};
export const remove = (id) => {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
};
```

**controllers/tasksController.js:**
```js
import * as Task from '../models/taskModel.js';

export const getAll = (req, res) => res.json(Task.getAll());

export const getOne = (req, res) => {
  const task = Task.findById(req.params.id);
  if (!task) return res.sendStatus(404);
  res.json(task);
};

export const create = (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(422).json({ error: 'Title ist erforderlich' });
  }
  res.status(201).json(Task.create(req.body));
};

export const replace = (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') return res.sendStatus(422);
  const updated = Task.replace(req.params.id, req.body);
  if (!updated) return res.sendStatus(404);
  res.json(updated);
};

export const markDone = (req, res) => {
  const task = Task.markDone(req.params.id);
  if (!task) return res.sendStatus(404);
  res.json(task);
};

export const remove = (req, res) => {
  if (!Task.remove(req.params.id)) return res.sendStatus(404);
  res.sendStatus(204);
};
```

**middleware/authMiddleware.js:**
```js
export function requireAuth(req, res, next) {
  if (!req.session?.authenticated) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  next();
}
```

**controllers/authController.js:**
```js
const USER = { email: 'user@example.com', password: 'secret123' };

export const login = (req, res) => {
  const { email, password } = req.body;
  if (email === USER.email && password === USER.password) {
    req.session.authenticated = true;
    req.session.email = email;
    return res.status(201).json({ email });
  }
  res.sendStatus(401);
};

export const verify = (req, res) => {
  if (req.session?.authenticated) return res.json({ email: req.session.email });
  res.sendStatus(401);
};

export const logout = (req, res) => {
  req.session.destroy(() => res.sendStatus(204));
};
```

**routes/tasksRoutes.js:**
```js
import { Router } from 'express';
import * as ctrl from '../controllers/tasksController.js';

const router = Router();
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.replace);
router.delete('/:id', ctrl.remove);
router.post('/:id/done', ctrl.markDone);
export default router;
```

**index.js:**
```js
import express from 'express';
import session from 'express-session';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import tasksRoutes from './routes/tasksRoutes.js';
import * as auth from './controllers/authController.js';
import { requireAuth } from './middleware/authMiddleware.js';

const app = express();
const swagger = JSON.parse(readFileSync('./swagger.json', 'utf8'));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));

app.post('/login', auth.login);
app.get('/verify', auth.verify);
app.delete('/logout', auth.logout);

app.use('/tasks', requireAuth, tasksRoutes);
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(3000, () => console.log('Server läuft auf Port 3000'));
```

### README.md Aufbau

```markdown
# Task API

## Setup
1. `npm install`
2. `.env` anlegen mit `SESSION_SECRET=...`
3. `npm start`

## Tests
Hoppscotch Collection in `/tests` importieren und ausführen.

## Dokumentation
Swagger UI: http://localhost:3000/swagger-ui/

## Login
- Email: user@example.com
- Passwort: secret123
```

### Sequenzdiagramm: Task als erledigt markieren

```
Client                                   Server
  |--- POST /tasks/{id}/done + Cookie --->|
  |                                       |-- requireAuth Middleware
  |                                       |   prüft req.session.authenticated
  |                                       |-- Task.markDone(id)
  |                                       |   setzt completedAt = now
  |<--- 200 OK + Task JSON ---------------|
```

---

## 13. Typische Prüfungsfragen

### Theoriefragen

1. **Was ist der Event Loop in Node.js?**
   Mechanismus, der asynchrone Operationen abarbeitet. Node.js ist single-threaded, aber dank Event Loop non-blocking.

2. **Unterschied Callback vs. Promise vs. async/await?**
   Callback: Funktion als Argument. Promise: Objekt für zukünftigen Wert mit `.then/.catch`. async/await: Syntax für Promises, liest sich synchron.

3. **Was bedeutet idempotent?**
   Mehrfache Ausführung hat denselben Effekt wie einmalige. GET, PUT, DELETE sind idempotent, POST nicht.

4. **Unterschied PUT vs. PATCH?**
   PUT ersetzt die ganze Ressource, PATCH ändert nur einzelne Felder.

5. **Was ist Middleware in Express?**
   Funktion `(req, res, next) => {}`, die zwischen Request und Response ausgeführt wird. Kann req/res manipulieren, Anfragen ablehnen oder mit `next()` weiterreichen.

6. **Was ist der Unterschied zwischen `req.params`, `req.query` und `req.body`?**
   - `req.params`: Pfadvariablen (`/users/:id`)
   - `req.query`: Query-String (`?name=Paul`)
   - `req.body`: Request-Body (benötigt Body-Parser)

7. **Warum HTTP Basic Auth über HTTPS?**
   Base64 ist keine Verschlüsselung – Credentials wären im Klartext lesbar.

8. **Was ist eine Session?**
   Serverseitige Zustandsspeicherung, der Client erhält eine Session-ID per Cookie.

9. **Was macht `express.json()`?**
   Middleware, die JSON-Body parst und als `req.body` verfügbar macht.

10. **Was ist REST?**
    Architektur-Stil: ressourcenorientiert, stateless, einheitliche Schnittstelle via HTTP-Verben.

11. **Warum OpenAPI/Swagger?**
    Standardisierte API-Doku, automatisch generiert, mit interaktiver UI, Client-Code-Generierung.

12. **Was ist ein Linter?**
    Tool, das Code statisch analysiert und Fehler/Stilprobleme findet, ohne ihn auszuführen.

13. **Was ist MVC?**
    Architekturmuster: Model (Daten), View (Darstellung), Controller (Logik). Bei APIs gibt's meist keine View.

14. **Welche Status Codes bei Validierungsfehler, nicht gefunden, nicht authentifiziert, Konflikt?**
    422, 404, 401, 409.

15. **Unterschied 401 vs. 403?**
    401 = nicht authentifiziert (wer bist du?). 403 = authentifiziert, aber nicht berechtigt.

### Code-Aufgaben (ohne Hilfsmittel!)

**Aufgabe A**: Schreibe eine async-Funktion, die drei URLs parallel fetcht und die Antworten als Array zurückgibt.

```js
async function fetchAll(urls) {
  const responses = await Promise.all(urls.map(u => fetch(u)));
  return Promise.all(responses.map(r => r.json()));
}
```

**Aufgabe B**: Implementiere einen Express-Endpunkt `POST /users`, der einen Body mit `name` und `email` entgegennimmt, beide validiert und den User mit einer generierten ID zurückgibt.

```js
import { randomUUID } from 'node:crypto';
const users = [];

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(422).json({ error: 'name und email erforderlich' });
  const user = { id: randomUUID(), name, email };
  users.push(user);
  res.status(201).json(user);
});
```

**Aufgabe C**: Middleware schreiben, die nur Anfragen mit Header `X-API-Key: geheim` durchlässt, sonst 401.

```js
function apiKey(req, res, next) {
  if (req.headers['x-api-key'] !== 'geheim') return res.sendStatus(401);
  next();
}
```

**Aufgabe D**: Array von Produkten (`{ name, price, category }`): Gruppiere sie nach Kategorie und berechne pro Kategorie die Summe der Preise.

```js
const grouped = products.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + p.price;
  return acc;
}, {});
```

**Aufgabe E**: Schreibe ein Session-Login für `admin`/`1234`, das `req.session.user` setzt.

```js
app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === 'admin' && pass === '1234') {
    req.session.user = user;
    return res.sendStatus(200);
  }
  res.sendStatus(401);
});
```

### Fragen zum Abschlussprojekt

1. **Wie generierst du eine eindeutige ID für einen Task?**
   `import { randomUUID } from 'node:crypto';` → `randomUUID()`.

2. **Wie verhinderst du, dass nicht authentifizierte Clients auf `/tasks` zugreifen?**
   Middleware `requireAuth` vor den Routen einhängen: `app.use('/tasks', requireAuth, tasksRoutes)`.

3. **Welcher Status Code bei leerem `title` in `POST /tasks`?**
   `422 Unprocessable Entity`.

4. **Wie wird `completedAt` gesetzt?**
   Beim Aufruf von `POST /tasks/:id/done` auf `new Date().toISOString()`.

5. **Warum Conventional Commits?**
   Einheitliches Format, maschinenlesbar, erleichtert Changelogs und Code-Review.

6. **Wie strukturierst du deinen Code?**
   In Routes, Controllers, Models und Middleware – jeweils eigene Ordner und Dateien.

7. **Wie dokumentierst du die API?**
   Mit OpenAPI-Spezifikation (swagger.json) und Swagger UI unter `/swagger-ui/`.

8. **Welche Umgebungsvariablen brauchst du?**
   Mindestens `SESSION_SECRET`, optional `PORT`, `NODE_ENV`.

9. **Wie würdest du Mehrbenutzerfähigkeit umsetzen?**
   Beim Erstellen eines Tasks `userId` aus `req.session` mitspeichern; bei Queries filtern auf `task.userId === req.session.userId`.

10. **Wie persistierst du Daten über Neustarts?**
    Option A: In eine JSON-Datei schreiben bei jeder Änderung (`fs.writeFile`). Option B: Datenbank (SQLite, PostgreSQL, MongoDB).

---

## Cheatsheet (Last-Minute vor der Prüfung)

**Express boilerplate auswendig:**
```js
import express from 'express';
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Hello'));

app.listen(3000);
```

**Status Codes:** 200, 201, 204 · 301, 302 · 400, 401, 403, 404, 409, 422 · 500

**Middleware-Signatur:** `(req, res, next) => { ... ; next(); }`

**Session-Setup:**
```js
app.use(session({ secret: 'x', resave: false, saveUninitialized: false }));
```

**UUID:** `import { randomUUID } from 'node:crypto'; randomUUID();`

**Zeitstempel:** `new Date().toISOString()`

**Array-Muster:**
- Summe: `arr.reduce((a, b) => a + b, 0)`
- Durchschnitt: `arr.reduce((a,b) => a+b, 0) / arr.length`
- Gruppieren: `arr.reduce((acc, x) => { acc[x.key] = (acc[x.key] || 0) + 1; return acc; }, {})`

**Promise.all:** `await Promise.all(promises)`

**fetch:**
```js
const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
const data = await res.json();
```

**Viel Erfolg bei der Prüfung!**