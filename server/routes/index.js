const { Router } = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const chartsRouter = require('./chartsRouter')

// Подключение. Пути слева — то, что ждёт клиент в ENDPOINTS.
// Файлы справа — то, что у тебя реально лежит в routes/.
router.use('/user', userRouter)
router.use('/charts', chartsRouter)

module.exports = router;