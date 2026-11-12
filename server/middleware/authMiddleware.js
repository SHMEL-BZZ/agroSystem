const jwt = require('jsonwebtoken')
require('dotenv').config()
const ApiError = require('../error/ApiError')

// Core-сервис только проверяет access-токен, выданный Auth Service
// (JWT_ACCESS_SECRET должен совпадать в обоих сервисах).
module.exports = (req, res, next) => {
    const header = req.headers.authorization
    const accessToken = header && header.split(' ')[1]
    if (!accessToken) return next(ApiError.unauthorized())
    try {
        req.user = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
        next()
    } catch (e) {
        return next(ApiError.unauthorized())
    }
}
