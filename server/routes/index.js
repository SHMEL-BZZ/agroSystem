const { Router } = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const chartsRouter = require('./chartsRouter')

router.use('/user', userRouter)
router.use('/charts', chartsRouter)

module.exports = router;