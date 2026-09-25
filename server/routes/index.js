const { Router } = require('express')
const router = new Router()

// Импорты роутеров
const userRouter = require('./userRouter')
const valveRouter = require('./valveRouter')
const greenhouseRouter = require('./greenhouseRouter')
const tankRouter = require('./tankRouter')
const tankPurposeRouter = require('./tankPurposeRouter')
const additiveRouter = require('./additiveRouter')
const solutionHistoryRouter = require('./solutionHistoryRouter')
const solutionCompositionRouter = require('./solutionCompositionRouter')
const wateringHistoryRouter = require('./wateringHistoryRouter')
const dailyConditionRouter = require('./dailyConditionRouter')
const drainHistoryRouter = require('./drainHistoryRouter')

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

module.exports = router