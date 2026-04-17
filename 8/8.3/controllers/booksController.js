const bookModel = require('../models/bookModel')

function getAll(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Returns all books'
    #swagger.responses[200] = { description: 'List of all books' }
  */
  res.json(bookModel.findAll())
}

function getOne(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Returns a single book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book found' }
    #swagger.responses[404] = { description: 'Book not found' }
  */
  const book = bookModel.findByIsbn(Number(req.params.isbn))
  if (!book) { return res.status(404).json({ error: 'Book not found' }) }
  res.json(book)
}

function create(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Creates a new book'
    #swagger.parameters['body'] = {
      in: 'body', required: true,
      schema: { isbn: 3, title: 'New Book', year: 2024, author: 'Author Name' }
    }
    #swagger.responses[200] = { description: 'Book created successfully' }
    #swagger.responses[422] = { description: 'Missing required fields' }
  */
  const { isbn, title, author, year } = req.body
  if (!isbn || !title || !author || !year) {
    return res.status(422).json({ error: 'isbn, title, author and year are required' })
  }
  res.json(bookModel.create(req.body))
}

function replace(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Replaces an entire book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book replaced successfully' }
  */
  const book = bookModel.replace(Number(req.params.isbn), req.body)
  if (!book) { return res.status(404).json({ error: 'Book not found' }) }
  res.json(book)
}

function update(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Partially updates a book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book updated successfully' }
  */
  const book = bookModel.update(Number(req.params.isbn), req.body)
  if (!book) { return res.status(404).json({ error: 'Book not found' }) }
  res.json(book)
}

function remove(req, res) {
  /*
    #swagger.tags = ['Books']
    #swagger.description = 'Deletes a book by ISBN'
    #swagger.parameters['isbn'] = { in: 'path', description: 'ISBN', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book deleted, returns remaining books' }
  */
  bookModel.remove(Number(req.params.isbn))
  res.json(bookModel.findAll())
}

module.exports = { getAll, getOne, create, replace, update, remove }
