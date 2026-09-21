const express = require('express')
const router = express.Router()

const userRouter = require('./userRouter')
const valveRouter = require('./valveRouter')
const greenhouseRouter = require('./greenhouseRouter')

const solutionHistoryRouter = require('./solutionHistoryRouter')
const wateringHistoryRouter = require('./wateringHistoryRouter')
const drainHistoryRouter = require('./drainHistoryRouter')

router.use('/user', userRouter)
router.use('/valve', valveRouter)
router.use('/greenhouse', greenhouseRouter)

router.use('/solution-history', solutionHistoryRouter)
router.use('/watering-history', wateringHistoryRouter)
router.use('/drain-history', drainHistoryRouter)

module.exports = router