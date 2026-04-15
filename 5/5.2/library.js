const express = require('express');
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

app.get('/books', (request, response) => {
  response.json(books);
});

app.get('/books/:isbn', (request, response) => {
  const isbn = Number(request.params.isbn)
  response.type('json').send(books.find(book => book.isbn == isbn))
});

app.post('/books', (request, response) => {
  books.push(request.body);
  response.json(books[books.length -1]);
});

app.put('/books/:isbn', (request, response) => {
  const isbn = Number(request.params.isbn)
  const index = books.findIndex(book => book.isbn == isbn)
  request.body = { ...request.body, isbn: isbn }
  books[index] = request.body
  response.json(books[index])
});

app.delete('/books/:isbn', (request, response) => {
  const isbn = Number(request.params.isbn)
  books = books.filter(item => item !== isbn);
  response.json(books);
});

app.patch('/books/:isbn', (request, response) => {
  const isbn = Number(request.params.isbn)
  const index = books.findIndex(book => book.isbn == isbn)
  books[index] = { ...books[index], ...request.body, isbn: isbn }
  response.json(books[index])
});

let lends = [];
let nextLendId = 1;

// GET /lends - return all lends
app.get('/lends', (request, response) => {
  response.json(lends);
});

// GET /lends/:id - return single lend
app.get('/lends/:id', (request, response) => {
  const id = Number(request.params.id);
  const lend = lends.find(l => l.id === id);
  if (!lend) return response.status(404).json({ error: 'Lend not found' });
  response.json(lend);
});

// POST /lends - borrow a book
app.post('/lends', (request, response) => {
  const { customerId, isbn } = request.body;

  // 422 - missing fields
  if (!customerId || !isbn) {
    return response.status(422).json({ error: 'customerId and isbn are required' });
  }

  // 404 - customer must exist
  const customer = customers.find(c => c.id === Number(customerId));
  if (!customer) {
    return response.status(404).json({ error: 'Customer not found' });
  }

  // 404 - book must exist
  const book = books.find(b => b.isbn === Number(isbn));
  if (!book) {
    return response.status(404).json({ error: 'Book not found' });
  }

  // 409 - book already borrowed and not returned
  const alreadyBorrowed = lends.some(l => l.isbn === Number(isbn) && !l.returnedAt);
  if (alreadyBorrowed) {
    return response.status(409).json({ error: 'Book is already borrowed' });
  }

  // 403 - customer already has 3 open lends
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

// DELETE /lends/:id - return a book
app.delete('/lends/:id', (request, response) => {
  const id = Number(request.params.id);
  const index = lends.findIndex(l => l.id === id);
  if (index === -1) return response.status(404).json({ error: 'Lend not found' });

  lends[index].returnedAt = new Date().toISOString();
  response.json(lends[index]);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});