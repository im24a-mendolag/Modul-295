// In-memory book store.
// A real app would use a database here.

const books = [
  { isbn: 1, title: 'The Pragmatic Programmer', year: 1999, author: 'Andrew Hunt' },
  { isbn: 2, title: 'Clean Code', year: 2008, author: 'Robert C. Martin' },
]

function findAll() {
  return books
}

function findByIsbn(isbn) {
  return books.find(b => b.isbn === isbn) || null
}

function create(data) {
  books.push(data)
  return books[books.length - 1]
}

function replace(isbn, data) {
  const index = books.findIndex(b => b.isbn === isbn)
  if (index === -1) { return null }
  books[index] = { ...data, isbn }
  return books[index]
}

function update(isbn, data) {
  const index = books.findIndex(b => b.isbn === isbn)
  if (index === -1) { return null }
  books[index] = { ...books[index], ...data, isbn }
  return books[index]
}

function remove(isbn) {
  const index = books.findIndex(b => b.isbn === isbn)
  if (index === -1) { return false }
  books.splice(index, 1)
  return true
}

module.exports = { findAll, findByIsbn, create, replace, update, remove }
