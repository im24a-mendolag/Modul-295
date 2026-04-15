const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const port = 3000;

const books = [
  { isbn: 1, title: 'The Pragmatic Programmer', year: 1999, author: 'Andrew Hunt' },
  { isbn: 2, title: 'Clean Code', year: 2008, author: 'Robert C. Martin' },
];

const customers = [
  { id: 1, name: 'Alice Müller' },
  { id: 2, name: 'Bob Schneider' },
  { id: 3, name: 'Clara Meier' },
];

app.use(express.json());
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── Books ─────────────────────────────────────────────────────────────────────

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
  response.type('json').send(books.find(book => book.isbn == isbn));
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
  */
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
  const index = books.findIndex(book => book.isbn == isbn);
  request.body = { ...request.body, isbn: isbn };
  books[index] = request.body;
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
  books = books.filter(item => item !== isbn);
  response.json(books);
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
  const index = books.findIndex(book => book.isbn == isbn);
  books[index] = { ...books[index], ...request.body, isbn: isbn };
  response.json(books[index]);
});

// ── Lends ─────────────────────────────────────────────────────────────────────

let lends = [];
let nextLendId = 1;

app.get('/lends', (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns all lends'
    #swagger.responses[200] = { description: 'List of all lends' }
  */
  response.json(lends);
});

app.get('/lends/:id', (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a single lend by ID'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Lend found' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const id = Number(request.params.id);
  const lend = lends.find(l => l.id === id);
  if (!lend) return response.status(404).json({ error: 'Lend not found' });
  response.json(lend);
});

app.post('/lends', (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Borrows a book for a customer'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { customerId: 1, isbn: 1 }
    }
    #swagger.responses[201] = { description: 'Lend created successfully' }
    #swagger.responses[404] = { description: 'Customer or book not found' }
    #swagger.responses[409] = { description: 'Book is already borrowed' }
    #swagger.responses[403] = { description: 'Customer already has 3 open lends' }
    #swagger.responses[422] = { description: 'Missing customerId or isbn' }
  */
  const { customerId, isbn } = request.body;

  if (!customerId || !isbn) {
    return response.status(422).json({ error: 'customerId and isbn are required' });
  }

  const customer = customers.find(c => c.id === Number(customerId));
  if (!customer) {
    return response.status(404).json({ error: 'Customer not found' });
  }

  const book = books.find(b => b.isbn === Number(isbn));
  if (!book) {
    return response.status(404).json({ error: 'Book not found' });
  }

  const alreadyBorrowed = lends.some(l => l.isbn === Number(isbn) && !l.returnedAt);
  if (alreadyBorrowed) {
    return response.status(409).json({ error: 'Book is already borrowed' });
  }

  const openLends = lends.filter(l => l.customerId === Number(customerId) && !l.returnedAt);
  if (openLends.length >= 3) {
    return response.status(403).json({ error: 'Customer already has 3 open lends' });
  }

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

app.delete('/lends/:id', (request, response) => {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a book (sets returnedAt timestamp)'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book returned successfully' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const id = Number(request.params.id);
  const index = lends.findIndex(l => l.id === id);
  if (index === -1) return response.status(404).json({ error: 'Lend not found' });

  lends[index].returnedAt = new Date().toISOString();
  response.json(lends[index]);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/swagger-ui/`);
});
