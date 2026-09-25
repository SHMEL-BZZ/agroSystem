const Router = require('express')
const router = new Router()
const controller = require('../controllers/generatorController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', controller.list)
router.post('/:name/run', authMiddleware, controller.run)
router.get('/:name/status', controller.status)
router.get('/:name/data', controller.data) 

module.exports = router