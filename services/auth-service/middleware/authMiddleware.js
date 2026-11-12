const ApiError = require('../error/ApiError')
const tokenService = require('../services/token-service')

module.exports = (req, res, next) => {
    const header = req.headers.authorization
    const accessToken = header && header.split(' ')[1]
    const userData = accessToken && tokenService.validateAccessToken(accessToken)
    if (!userData) return next(ApiError.unauthorized())
    req.user = userData
    next()
}
