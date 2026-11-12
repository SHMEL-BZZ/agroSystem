const { Router } = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

// публичные
router.post('/register', userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.post('/refresh', userController.refresh)
router.get('/activate/:link', userController.activate)

// требуют access-токен
router.get('/users', authMiddleware, userController.getUsers)

module.exports = router
