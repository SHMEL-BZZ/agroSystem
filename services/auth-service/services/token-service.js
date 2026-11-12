const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { Token } = require('../models/models')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '10h', jwtid: crypto.randomUUID() })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d', jwtid: crypto.randomUUID() })
        return { accessToken, refreshToken }
    }

    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch (e) {
            return null
        }
    }

    // Новая сессия (вход/регистрация) — новая запись, чтобы вход с другого устройства
    // не разлогинивал остальные. При обновлении передаётся строка старого токена (ротация).
    async saveToken(userId, refreshToken, oldTokenRow = null) {
        if (oldTokenRow) {
            oldTokenRow.refreshToken = refreshToken
            return oldTokenRow.save()
        }
        return Token.create({ userId, refreshToken })
    }

    async removeToken(refreshToken) {
        return Token.destroy({ where: { refreshToken } })
    }

    async findToken(refreshToken) {
        return Token.findOne({ where: { refreshToken } })
    }
}

module.exports = new TokenService()
