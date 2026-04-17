const express = require('express')
const router = express.Router()
const lendsController = require('../controllers/lendsController')
const { requireAuth } = require('../middleware/authMiddleware')

router.get('/', requireAuth, lendsController.getAll)
router.get('/:id', requireAuth, lendsController.getOne)
router.post('/', requireAuth, lendsController.create)
router.delete('/:id', requireAuth, lendsController.returnBook)

module.exports = router
