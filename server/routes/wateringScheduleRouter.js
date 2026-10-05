const Router = require('express')
const router = new Router()
const controller = require('../controllers/wateringScheduleController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', controller.getByDate)
router.post('/', authMiddleware, controller.save)
router.delete('/', authMiddleware, controller.remove)

module.exports = router