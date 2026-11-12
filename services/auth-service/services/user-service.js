const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { User } = require('../models/models')
const ApiError = require('../error/ApiError')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class UserService {
    async registration(login, password, email) {
        if (typeof login !== 'string' || login.length < 3 || login.length > 50) {
            throw ApiError.badRequest('Логин должен быть от 3 до 50 символов')
        }
        if (typeof password !== 'string' || password.length < 6) {
            throw ApiError.badRequest('Пароль должен быть минимум 6 символов')
        }

        const hasEmail = email !== undefined && email !== null
        if (hasEmail) {
            if (typeof email !== 'string' || email === '') {
                throw ApiError.badRequest('Email не может быть пустым')
            }
            if (!EMAIL_REGEX.test(email)) {
                throw ApiError.badRequest('Некорректный email')
            }
            if (await User.findOne({ where: { email } })) {
                throw ApiError.badRequest('Пользователь с таким email уже существует')
            }
        }

        if (await User.findOne({ where: { login } })) {
            throw ApiError.badRequest('Пользователь с таким login уже существует')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const activationLink = crypto.randomUUID()
        const user = await User.create({
            login,
            password: hashPassword,
            email: hasEmail ? email : null,
            activationLink
        })

        if (hasEmail) {
            const apiUrl = process.env.API_URL || `http://localhost:${process.env.AUTH_PORT || 5001}`
            await mailService.sendActivationMail(email, `${apiUrl}/api/user/activate/${activationLink}`)
        }

        return this.issueTokens(user)
    }

    async activate(activationLink) {
        const user = await User.findOne({ where: { activationLink } })
        if (!user) {
            throw ApiError.badRequest('Некорректная ссылка активации')
        }
        user.isActivated = true
        await user.save()
    }

    // identifier — логин или email
    async login(identifier, password) {
        if (!identifier || !password) {
            throw ApiError.badRequest('Укажите логин (или email) и пароль')
        }
        let user = await User.findOne({ where: { login: identifier } })
        if (!user && EMAIL_REGEX.test(identifier)) {
            user = await User.findOne({ where: { email: identifier } })
        }
        if (!user) {
            throw ApiError.badRequest('Пользователь не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.badRequest('Неверный пароль')
        }
        return this.issueTokens(user)
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
        if (!user) {
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
