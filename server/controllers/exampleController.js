// Пример контроллера

const Controller = require('express')
const controller = new Controller()
const exampleRouter = require('../routes/exampleRouter')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', exampleRouter.create)
router.get('/', exampleRouter.getAll)

module.exports = controller