const express = require('express')
const router = express.Router()
const booksController = require('../controllers/booksController')

router.get('/', booksController.getAll)
router.get('/:isbn', booksController.getOne)
router.post('/', booksController.create)
router.put('/:isbn', booksController.replace)
router.patch('/:isbn', booksController.update)
router.delete('/:isbn', booksController.remove)

module.exports = router
