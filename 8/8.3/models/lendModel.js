// In-memory lend store.

const lends = []
let nextId = 1

const customers = [
  { id: 1, name: 'Alice Müller' },
  { id: 2, name: 'Bob Schneider' },
  { id: 3, name: 'Clara Meier' },
]

function findAll() {
  return lends
}

function findById(id) {
  return lends.find(l => l.id === id) || null
}

function findCustomer(customerId) {
  return customers.find(c => c.id === customerId) || null
}

function isBookBorrowed(isbn) {
  return lends.some(l => l.isbn === isbn && !l.returnedAt)
}

function countOpenLends(customerId) {
  return lends.filter(l => l.customerId === customerId && !l.returnedAt).length
}

function create(customerId, isbn) {
  const lend = {
    id: nextId++,
    customerId,
    isbn,
    borrowedAt: new Date().toISOString(),
    returnedAt: null,
  }
  lends.push(lend)
  return lend
}

function returnBook(id) {
  const index = lends.findIndex(l => l.id === id)
  if (index === -1) { return null }
  lends[index].returnedAt = new Date().toISOString()
  return lends[index]
}

module.exports = { findAll, findById, findCustomer, isBookBorrowed, countOpenLends, create, returnBook }
