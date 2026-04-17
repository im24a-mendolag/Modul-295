const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const { findUser } = require('./db');

const app = express();
const port = 3000;

// ── In-memory data ─────────────────────────────────────────────────────────────

const books = [
  { isbn: 1, title: 'The Pragmatic Programmer', year: 1999, author: 'Andrew Hunt' },
  { isbn: 2, title: 'Clean Code', year: 2008, author: 'Robert C. Martin' },
];

const customers = [
  { id: 1, name: 'Alice Müller' },
  { id: 2, name: 'Bob Schneider' },
  { id: 3, name: 'Clara Meier' },
];

let lends = [];
let nextLendId = 1;

// ── Middleware ─────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

app.use(session({
  secret: 'library-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Auth middleware ────────────────────────────────────────────────────────────

function requireAuth(request, response, next) {
  if (request.session.authenticated) {
    return next();
  }
  response.status(401).json({ error: 'Unauthorized – please log in first' });
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

app.post('/login', (request, response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Log in with email and password'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { email: 'desk@library.example', password: 'm295' }
    }
    #swagger.responses[201] = { description: 'Login successful, returns email' }
    #swagger.responses[401] = { description: 'Invalid credentials' }
  */
  const { email, password } = request.body;
  const user = findUser(email, password);

  if (!user) {
    return response.status(401).json({ error: 'Invalid email or password' });
  }

  request.session.authenticated = true;
  request.session.email = user.email;
  response.status(201).json({ email: user.email });
});

app.get('/verify', (request, response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Verify if the current session is authenticated'
    #swagger.responses[200] = { description: 'Authenticated – returns email' }
    #swagger.responses[401] = { description: 'Not authenticated' }
  */
  if (request.session.authenticated) {
    return response.status(200).json({ email: request.session.email });
  }
  response.status(401).json({ error: 'Not authenticated' });
});

app.delete('/logout', (request, response) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.description = 'Log out – destroys the current session'
    #swagger.responses[204] = { description: 'Logged out successfully' }
  */
  request.session.destroy(() => {
    response.status(204).send();
  });
});

// ── Books ──────────────────────────────────────────────────────────────────────

app.get('/books', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Returns all books'
    #swagger.responses[200] = { description: 'List of all books' }
  */
  response.json(books);
});

app.get('/books/:isbn', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Returns a single book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN of the book', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book found' }
    #swagger.responses[404] = { description: 'Book not found' }
  */
  const isbn = Number(request.params.isbn);
  const book = books.find(b => b.isbn === isbn);
  if (!book) return response.status(404).json({ error: 'Book not found' });
  response.json(book);
});

app.post('/books', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Creates a new book'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { isbn: 3, title: 'New Book', year: 2024, author: 'Author Name' }
    }
    #swagger.responses[200] = { description: 'Book created successfully' }
    #swagger.responses[422] = { description: 'Missing required fields' }
  */
  const { isbn, title, author, year } = request.body;
  if (!isbn || !title || !author || !year) {
    return response.status(422).json({ error: 'isbn, title, author and year are required' });
  }
  books.push(request.body);
  response.json(books[books.length - 1]);
});

app.put('/books/:isbn', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Replaces an entire book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN of the book', required: true, type: 'integer' }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { title: 'Updated Title', year: 2024, author: 'Author Name' }
    }
    #swagger.responses[200] = { description: 'Book replaced successfully' }
  */
  const isbn = Number(request.params.isbn);
  const index = books.findIndex(b => b.isbn === isbn);
  books[index] = { ...request.body, isbn };
  response.json(books[index]);
});

app.patch('/books/:isbn', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Partially updates a book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN of the book', required: true, type: 'integer' }
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { year: 2025 }
    }
    #swagger.responses[200] = { description: 'Book updated successfully' }
  */
  const isbn = Number(request.params.isbn);
  const index = books.findIndex(b => b.isbn === isbn);
  books[index] = { ...books[index], ...request.body, isbn };
  response.json(books[index]);
});

app.delete('/books/:isbn', (request, response) => {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Deletes a book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN of the book', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book deleted, returns remaining books' }
  */
  const isbn = Number(request.params.isbn);
  const index = books.findIndex(b => b.isbn === isbn);
  books.splice(index, 1);
  response.json(books);
});

// ── Lends (protected) ──────────────────────────────────────────────────────────

app.get('/lends', requireAuth, (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns all lends (requires login)'
    #swagger.responses[200] = { description: 'List of all lends' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  response.json(lends);
});

app.get('/lends/:id', requireAuth, (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a single lend by ID (requires login)'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Lend found' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const id = Number(request.params.id);
  const lend = lends.find(l => l.id === id);
  if (!lend) return response.status(404).json({ error: 'Lend not found' });
  response.json(lend);
});

app.post('/lends', requireAuth, (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Borrows a book for a customer (requires login)'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { customerId: 1, isbn: 1 }
    }
    #swagger.responses[201] = { description: 'Lend created successfully' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[403] = { description: 'Customer already has 3 open lends' }
    #swagger.responses[404] = { description: 'Customer or book not found' }
    #swagger.responses[409] = { description: 'Book is already borrowed' }
    #swagger.responses[422] = { description: 'Missing customerId or isbn' }
  */
  const { customerId, isbn } = request.body;

  if (!customerId || !isbn) {
    return response.status(422).json({ error: 'customerId and isbn are required' });
  }

  const customer = customers.find(c => c.id === Number(customerId));
  if (!customer) return response.status(404).json({ error: 'Customer not found' });

  const book = books.find(b => b.isbn === Number(isbn));
  if (!book) return response.status(404).json({ error: 'Book not found' });

  const alreadyBorrowed = lends.some(l => l.isbn === Number(isbn) && !l.returnedAt);
  if (alreadyBorrowed) return response.status(409).json({ error: 'Book is already borrowed' });

  const openLends = lends.filter(l => l.customerId === Number(customerId) && !l.returnedAt);
  if (openLends.length >= 3) return response.status(403).json({ error: 'Customer already has 3 open lends' });

  const lend = {
    id: nextLendId++,
    customerId: Number(customerId),
    isbn: Number(isbn),
    borrowedAt: new Date().toISOString(),
    returnedAt: null,
  };
  lends.push(lend);
  response.status(201).json(lend);
});

app.delete('/lends/:id', requireAuth, (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a book – sets returnedAt timestamp (requires login)'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book returned successfully' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const id = Number(request.params.id);
  const index = lends.findIndex(l => l.id === id);
  if (index === -1) return response.status(404).json({ error: 'Lend not found' });

  lends[index].returnedAt = new Date().toISOString();
  response.json(lends[index]);
});

// ── Start server ───────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`Swagger UI:  http://localhost:${port}/swagger-ui/`);
  console.log(`Login form:  http://localhost:${port}/login.html`);
});
