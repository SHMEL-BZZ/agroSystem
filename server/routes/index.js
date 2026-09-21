const express = require('express')
const router = express.Router()

const userRouter = require('./userRouter')
const valveRouter = require('./valveRouter')
const greenhouseRouter = require('./greenhouseRouter')
const greenhouseValveRouter = require('./greenhouseValveRouter')

const tankPurposeRouter = require('./tankPurposeRouter')
const tankRouter = require('./tankRouter')

const dailyConditionRouter = require('./dailyConditionRouter')
const additiveRouter = require('./additiveRouter')

const solutionHistoryRouter = require('./solutionHistoryRouter')
const solutionCompositionRouter = require('./solutionCompositionRouter')
const wateringHistoryRouter = require('./wateringHistoryRouter')
const drainHistoryRouter = require('./drainHistoryRouter')

router.use('/user', userRouter)
router.use('/valve', valveRouter)
router.use('/greenhouse', greenhouseRouter)
router.use('/greenhouse-valve', greenhouseValveRouter)

router.use('/tank-purpose', tankPurposeRouter)
router.use('/tank', tankRouter)

router.use('/condition', dailyConditionRouter)
router.use('/additive', additiveRouter)

router.use('/solution-history', solutionHistoryRouter)
router.use('/composition', solutionCompositionRouter)
router.use('/watering-history', wateringHistoryRouter)
router.use('/drain-history', drainHistoryRouter)

module.exports = router