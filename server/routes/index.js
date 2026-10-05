const { Router } = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const chartsRouter = require('./chartsRouter')

// Подключение. Пути слева — то, что ждёт клиент в ENDPOINTS.
// Файлы справа — то, что у тебя реально лежит в routes/.
router.use('/user', userRouter)
router.use('/valve', valveRouter)
router.use('/greenhouse', greenhouseRouter)
router.use('/tank', tankRouter)
router.use('/tank-purpose', tankPurposeRouter)
router.use('/additive', additiveRouter)
router.use('/solution', solutionHistoryRouter)
router.use('/solution-composition', solutionCompositionRouter)
router.use('/watering', wateringHistoryRouter)
router.use('/condition', dailyConditionRouter)
router.use('/drain', drainHistoryRouter)
router.use('/solution-history', solutionHistoryRouter)

module.exports = router;