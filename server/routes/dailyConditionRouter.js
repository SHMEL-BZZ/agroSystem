const express = require('express')
const router = express.Router()
const controller = require('../controllers/dailyConditionController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, controller.create)
router.get('/', controller.getAll)
router.get('/:valveId/:date', controller.getOne)
router.put('/:valveId/:date', authMiddleware, controller.update)
router.delete('/:valveId/:date', authMiddleware, controller.delete)

module.exports = router