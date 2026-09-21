const Router = require('express')
const router = new Router()
const valveController = require('../controllers/valveController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, valveController.create)
router.get('/', valveController.getAll)
router.get('/:id', valveController.getOne)
router.put('/:id', authMiddleware, valveController.update)
router.delete('/:id', authMiddleware, valveController.delete)

module.exports = router 