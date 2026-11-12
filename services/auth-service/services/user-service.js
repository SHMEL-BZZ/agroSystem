const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { User } = require('../models/models')
const ApiError = require('../error/ApiError')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


const pending = new Map()
const PENDING_TTL = 24 * 60 * 60 * 1000

const findPending = (identifier) => {
    for (const [link, p] of pending) {
        if (p.expires < Date.now()) { pending.delete(link); continue }
        if (p.login === identifier || p.email === identifier) return [link, p]
    }
    return []
}

class UserService {
    async registration(login, password, email) {
        if (typeof login !== 'string' || login.length < 3 || login.length > 50) {
            throw ApiError.badRequest('Логин должен быть от 3 до 50 символов')
        }
        if (typeof password !== 'string' || password.length < 6) {
            throw ApiError.badRequest('Пароль должен быть минимум 6 символов')
        }
        if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
            throw ApiError.badRequest('Укажите корректный email')
        }
        if (await User.findOne({ where: { email } })) {
            throw ApiError.badRequest('Пользователь с таким email уже существует')
        }
        if (await User.findOne({ where: { login } })) {
            throw ApiError.badRequest('Пользователь с таким login уже существует')
        }

        for (const key of [login, email]) {
            const [oldLink] = findPending(key)
            if (oldLink) pending.delete(oldLink)
        }

        const link = crypto.randomUUID()
        pending.set(link, {
            login,
            email,
            password: await bcrypt.hash(password, 10),
            expires: Date.now() + PENDING_TTL
        })

        await this.sendActivation(email, link)
        return { needActivation: true, email, message: 'Письмо с подтверждением отправлено на почту' }
    }

    async sendActivation(email, link) {
        const apiUrl = process.env.API_URL || `http://localhost:${process.env.AUTH_PORT || 5001}`
        return mailService.sendActivationMail(email, `${apiUrl}/api/user/activate/${link}`)
    }

    async resendActivation(identifier) {
        const [link, p] = findPending(identifier)
        if (!p) throw ApiError.badRequest('Заявка не найдена — зарегистрируйтесь заново')
        const sent = await this.sendActivation(p.email, link)
        if (!sent) throw ApiError.internal('Не удалось отправить письмо, попробуйте позже')
    }

    async activate(link) {
        const p = pending.get(link)
        if (!p || p.expires < Date.now()) {
            throw ApiError.badRequest('Ссылка недействительна, устарела или уже использована')
        }
        pending.delete(link)
        if (await User.findOne({ where: { login: p.login } }) || await User.findOne({ where: { email: p.email } })) {
            throw ApiError.badRequest('Пользователь с таким логином или почтой уже существует')
        }
        return User.create({ login: p.login, email: p.email, password: p.password, isActivated: true })
    }

    async login(identifier, password) {
        if (!identifier || !password) {
            throw ApiError.badRequest('Укажите логин (или email) и пароль')
        }
        const user = await this.findByIdentifier(identifier)
        if (!user) {
            throw ApiError.badRequest('Пользователь не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.badRequest('Неверный пароль')
        }
        if (!user.isActivated) {
            const err = ApiError.forbidden('Подтвердите почту: мы отправили вам письмо со ссылкой')
            err.code = 'EMAIL_NOT_ACTIVATED'
            err.email = user.email
            throw err
        }
        return this.issueTokens(user)
    }

    async findByIdentifier(identifier) {
        let user = await User.findOne({ where: { login: identifier } })
        if (!user && EMAIL_REGEX.test(identifier)) {
            user = await User.findOne({ where: { email: identifier } })
        }
        return user
    }

    async logout(refreshToken) {
        if (!refreshToken) return 0
        return tokenService.removeToken(refreshToken)
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.unauthorized()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if (!userData || !tokenFromDb) {
            throw ApiError.unauthorized()
        }
        const user = await User.findByPk(userData.id)
        if (!user || !user.isActivated) {
            throw ApiError.unauthorized()
        }
        return this.issueTokens(user, tokenFromDb)
    }

    async getAllUsers() {
        const users = await User.findAll()
        return users.map(u => new UserDto(u))
    }

    async issueTokens(user, oldTokenRow = null) {
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken, oldTokenRow)
        return { ...tokens, user: userDto }
    }
}

module.exports = new UserService()