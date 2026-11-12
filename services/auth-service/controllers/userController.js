const userService = require('../services/user-service')

const COOKIE_OPTIONS = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
}

class UserController {
    async registration(req, res, next) {
        try {
            const { login, password, email } = req.body || {}
            const userData = await userService.registration(login, password, email)
            res.cookie('refreshToken', userData.refreshToken, COOKIE_OPTIONS)
            return res.status(201).json(userData)
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
            await userService.activate(req.params.link)
            return res.redirect(process.env.CLIENT_URL || '/')
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
