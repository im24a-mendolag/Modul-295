const express = require('express');
const app = express();
const port = 3000;

const books = [
  { isbn: 1, title: 'The Pragmatic Programmer', year: 1999, author: 'Andrew Hunt' },
  { isbn: 2, title: 'Clean Code', year: 2008, author: 'Robert C. Martin' },
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
  request.body = { ...request.body, isbn: isbn }
  books[books.findIndex(book => book.isbn == isbn)] = request.body
  response.json(book[books.findIndex(book => book.isbn == isbn)])
});

app.delete('/books', (request, response) => {
  response.json(books);
});

app.patch('/books/:isbn', (request, response) => {
  const isbn = Number(request.params.isbn)
  response.type('json').send(books.find(book => book.isbn == isbn))
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});