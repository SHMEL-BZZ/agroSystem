const crypto = require('crypto')
const userService = require('../services/user-service')
const ApiError = require('../error/ApiError')

const activationCodes = new Map()
const CODE_TTL = 2 * 60 * 1000

const COOKIE_OPTIONS = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
}

class UserController {
    async registration(req, res, next) {
        try {
            const { login, password, email } = req.body || {}
            const result = await userService.registration(login, password, email)
            return res.status(201).json(result)
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { login, email, password } = req.body || {}
            const userData = await userService.login(login || email, password)
            res.cookie('refreshToken', userData.refreshToken, COOKIE_OPTIONS)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies || {}
            await userService.logout(refreshToken)
            res.clearCookie('refreshToken')
            return res.json({ message: 'Выход выполнен' })
        } catch (e) {
            next(e)
        }
    }

    async activate(req, res, next) {
        try {
            const user = await userService.activate(req.params.link)
            const tokens = await userService.issueTokens(user)
            res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS)
            const code = crypto.randomUUID()
            activationCodes.set(code, { userId: user.id, expires: Date.now() + CODE_TTL })
            const client = (process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/+$/, '')
            return res.redirect(`${client}/login?activated=1&code=${code}`)
        } catch (e) {
            if (e.status === 400) {
                const client = (process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/+$/, '')
                return res.redirect(`${client}/login?activated=0`)
            }
            next(e)
        }
    }

    async exchangeActivation(req, res, next) {
        try {
            const code = (req.body || {}).code
            const entry = activationCodes.get(code)
            activationCodes.delete(code) // одноразовый
            if (!entry || entry.expires < Date.now()) {
                throw ApiError.unauthorized()
            }
            const userData = await userService.issueTokensByUserId(entry.userId)
            res.cookie('refreshToken', userData.refreshToken, COOKIE_OPTIONS)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async resendActivation(req, res, next) {
        try {
            await userService.resendActivation((req.body || {}).login || (req.body || {}).email)
            return res.json({ message: 'Письмо отправлено повторно' })
        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies || {}
            const userData = await userService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, COOKIE_OPTIONS)
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }

    async getUsers(req, res, next) {
        try {
            return res.json(await userService.getAllUsers())
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()