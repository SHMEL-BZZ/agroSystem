const express = require('express')
const router = express.Router()
const controller = require('../controllers/solutionCompositionController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, controller.create)
router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.put('/:id', authMiddleware, controller.update)
router.delete('/:id', authMiddleware, controller.delete)

module.exports = router