const lendModel = require('../models/lendModel')
const bookModel = require('../models/bookModel')

function getAll(req, res) {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns all lends (requires login)'
    #swagger.responses[200] = { description: 'List of all lends' }
    #swagger.responses[401] = { description: 'Unauthorized' }
  */
  res.json(lendModel.findAll())
}

function getOne(req, res) {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a single lend by ID (requires login)'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Lend found' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const lend = lendModel.findById(Number(req.params.id))
  if (!lend) { return res.status(404).json({ error: 'Lend not found' }) }
  res.json(lend)
}

function create(req, res) {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Borrows a book for a customer (requires login)'
    #swagger.parameters['body'] = {
      in: 'body', required: true,
      schema: { customerId: 1, isbn: 1 }
    }
    #swagger.responses[201] = { description: 'Lend created successfully' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[403] = { description: 'Customer already has 3 open lends' }
    #swagger.responses[404] = { description: 'Customer or book not found' }
    #swagger.responses[409] = { description: 'Book is already borrowed' }
    #swagger.responses[422] = { description: 'Missing customerId or isbn' }
  */
  const { customerId, isbn } = req.body

  if (!customerId || !isbn) {
    return res.status(422).json({ error: 'customerId and isbn are required' })
  }

  const customer = lendModel.findCustomer(Number(customerId))
  if (!customer) { return res.status(404).json({ error: 'Customer not found' }) }

  const book = bookModel.findByIsbn(Number(isbn))
  if (!book) { return res.status(404).json({ error: 'Book not found' }) }

  if (lendModel.isBookBorrowed(Number(isbn))) {
    return res.status(409).json({ error: 'Book is already borrowed' })
  }

  if (lendModel.countOpenLends(Number(customerId)) >= 3) {
    return res.status(403).json({ error: 'Customer already has 3 open lends' })
  }

  const lend = lendModel.create(Number(customerId), Number(isbn))
  res.status(201).json(lend)
}

function returnBook(req, res) {
  /*
    #swagger.tags = ['Lends']
    #swagger.description = 'Returns a book – sets returnedAt timestamp (requires login)'
    #swagger.parameters['id'] = { in: 'path', description: 'ID of the lend', required: true, type: 'integer' }
    #swagger.responses[200] = { description: 'Book returned successfully' }
    #swagger.responses[401] = { description: 'Unauthorized' }
    #swagger.responses[404] = { description: 'Lend not found' }
  */
  const lend = lendModel.returnBook(Number(req.params.id))
  if (!lend) { return res.status(404).json({ error: 'Lend not found' }) }
  res.json(lend)
}

module.exports = { getAll, getOne, create, returnBook }
