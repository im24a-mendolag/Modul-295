# Modul 295 – Prüfungs-Cheatsheet

## Node.js Grundlagen
- **Single-threaded, non-blocking, event-driven** – Event Loop verarbeitet async Operationen
- Module: `require()` (CommonJS) oder `import` (ES Modules, `"type":"module"` in package.json)
- `process.argv[2]` = erstes Argument, `process.env.X` = Umgebungsvariable

## Async-Programmierung
```js
// Callback → Promise → async/await (bevorzugt)
async function beispiel() {
  try {
    const res = await fetch(url);
    const data = await res.json();
  } catch (err) { console.error(err); }
}
// Parallel:
const results = await Promise.all([fetch(url1), fetch(url2)]);
```

## Array-Methoden (auswendig!)
| Methode | Rückgabe | Zweck |
|---------|----------|-------|
| `map` | neues Array | transformieren |
| `filter` | neues Array | filtern |
| `reduce` | einzelner Wert | aggregieren |
| `find` | Element / undefined | erstes passendes |
| `findIndex` | Index / -1 | Index des ersten |
| `some` / `every` | Boolean | mind. eines / alle |
| `flatMap` | neues Array | map + flatten |

```js
// Summe:      arr.reduce((a, b) => a + b.price, 0)
// Gruppieren: arr.reduce((acc, x) => { acc[x.k] = (acc[x.k]||0)+1; return acc; }, {})
// Kette:      arr.filter(x => x.active).map(x => x.name)
```

## HTTP & REST
**Verben:** GET (lesen) · POST (erstellen) · PUT (ersetzen) · PATCH (teilweise ändern) · DELETE (löschen)
**Idempotent:** GET, PUT, DELETE – mehrfach = gleicher Effekt. POST nicht idempotent.

**Status Codes:**
- `200` OK · `201` Created · `204` No Content
- `301` Moved · `302` Found
- `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Validation Error
- `500` Server Error

**REST-Regeln:** Substantive plural (`/books`), IDs im Pfad (`/books/:id`), Daten im Body (kein Query für POST/PUT), Content-Type: `application/json`

## Express.js
```js
import express from 'express';
const app = express();
app.use(express.json());           // Body-Parser (PFLICHT für req.body)

app.get('/books/:id', (req, res) => {
  // req.params.id  req.query.x  req.body  req.headers['auth']
  res.status(200).json({ id: req.params.id });
});
app.listen(3000);
```

**Middleware:** `(req, res, next) => { /* ... */ next(); }` — `next()` MUSS aufgerufen werden!

## REST API Muster
```js
app.get('/books', (req, res) => res.json(books));                        // 200
app.get('/books/:id', (req, res) => {
  const b = books.find(b => b.id === req.params.id);
  if (!b) return res.sendStatus(404);
  res.json(b);
});
app.post('/books', (req, res) => {
  if (!req.body.title) return res.status(422).json({ error: 'Pflichtfeld' });
  const b = { id: randomUUID(), ...req.body };
  books.push(b); res.status(201).json(b);
});
app.put('/books/:id', (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  books[idx] = { id: req.params.id, ...req.body }; res.json(books[idx]);
});
app.delete('/books/:id', (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.sendStatus(404);
  books.splice(idx, 1); res.sendStatus(204);
});
```

## Session-Authentifizierung
```js
import session from 'express-session';
app.use(session({ secret: 'x', resave: false, saveUninitialized: false }));

app.post('/login', (req, res) => {
  if (req.body.email === 'a@b.c' && req.body.password === '1234') {
    req.session.authenticated = true;
    return res.status(201).json({ email: req.body.email });
  }
  res.sendStatus(401);
});
app.get('/verify', (req, res) => {
  if (req.session?.authenticated) return res.json({ email: req.session.email });
  res.sendStatus(401);
});
app.delete('/logout', (req, res) => req.session.destroy(() => res.sendStatus(204)));

// Auth-Middleware
function requireAuth(req, res, next) {
  if (!req.session?.authenticated) return res.sendStatus(401);
  next();
}
app.use('/tasks', requireAuth, tasksRouter);
```

## Projektstruktur (MVC)
```
src/
  routes/      tasksRoutes.js
  controllers/ tasksController.js
  models/      taskModel.js
  middleware/  authMiddleware.js
app.js
```

## Task-API (Abschlussprojekt)
```js
// Felder: id(UUID), title(Pflicht), description?, createdAt(auto), dueDate?, completedAt?
import { randomUUID } from 'node:crypto';

// POST /tasks/:id/done → setzt completedAt
task.completedAt = new Date().toISOString(); // 200

// DELETE /tasks/:id → 200 oder 204
// POST /tasks mit leerem title → 422
```

## OpenAPI / Swagger
```js
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
const spec = swaggerJsdoc({ definition: { openapi:'3.0.0', info:{title:'API',version:'1.0'} }, apis:['./src/routes/*.js'] });
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
// In Routen: /** @openapi \n * /path: \n *   get: ... */
```

## ESLint
```bash
npm init @eslint/config@latest   # Setup
npx eslint .                     # Prüfen
npx eslint . --fix               # Auto-Fix
```

## Conventional Commits
```
feat: add task completion endpoint
fix: handle empty title validation
docs: update README setup steps
refactor: extract task model
test: add auth tests
chore: update dependencies
```

## Hoppscotch Tests
```js
pw.test("Status 201", () => pw.expect(pw.response.status).toBe(201));
pw.test("Hat ID", () => pw.expect(pw.response.body).toHaveProperty("id"));
pw.env.set("token", pw.response.body.token);  // Variable speichern
pw.env.set("id", pw.response.body.id);
```

## Schnell-Referenz
```js
randomUUID()              // node:crypto – eindeutige ID
new Date().toISOString()  // Zeitstempel: "2026-04-17T10:00:00.000Z"
Buffer.from(str,'base64').toString()  // Basic Auth dekodieren
req.headers.authorization.slice(7)   // "Bearer TOKEN" → "TOKEN"
```

**401 vs 403:** 401 = nicht eingeloggt · 403 = eingeloggt, aber kein Zugriff
**PUT vs PATCH:** PUT = ganze Ressource ersetzen · PATCH = einzelne Felder ändern
**Session vs JWT:** Session = serverseitig gespeichert · JWT = Token beim Client, signiert
