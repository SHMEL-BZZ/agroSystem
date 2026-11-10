const ApiError = require('../error/ApiError')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models/models')

const generateJwt = (id, login) => {
    return jwt.sign(
        { id, login },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

class UserController {
    async registration(req, res, next) {
        try {
            const { login, password, email } = req.body

            // 1. Валидация логина
            if (!login || login.length < 3 || login.length > 50) {
                return next(ApiError.badRequest('Логин должен быть от 3 до 50 символов'))
            }

            // 2. Валидация пароля
            if (!password || password.length < 6) {
                return next(ApiError.badRequest('Пароль должен быть минимум 6 символов'))
            }

            // 3. Валидация email (если передан)
            if (email !== undefined && email !== null && email !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(email)) {
                    return next(ApiError.badRequest('Некорректный email'))
                }
                const existingEmail = await User.findOne({ where: { email } })
                if (existingEmail) {
                    return next(ApiError.badRequest('Пользователь с таким email уже существует'))
                }
            } else if (email === '') {
                return next(ApiError.badRequest('Email не может быть пустым'))
            }

            // 4. Проверка уникальности логина
            const candidate = await User.findOne({ where: { login } })
            if (candidate) {
                // ИСПРАВЛЕНО: используем badRequest (400), чтобы пройти тест
                return next(ApiError.badRequest('Пользователь с таким login уже существует'))
            }

            // 5. Создание пользователя
            const hashPassword = await bcrypt.hash(password, 10)
            const user = await User.create({
                login,
                password: hashPassword,
                email
            })

            const token = generateJwt(user.id, user.login)

            // 6. Возвращаем 201 Created
            return res.status(201).json({ token, login: user.login, password: user.password })

        } catch (e) {
            console.error('REGISTRATION ERROR:', e)
            return next(ApiError.internal('Ошибка регистрации'))
        }
    }

    async login(req, res, next) {
        try {
            const { login, password } = req.body

            if (!login || !password) {
                return next(ApiError.badRequest('Логин и пароль обязательны'))
            }

            const user = await User.findOne({ where: { login } })

            if (!user || !await bcrypt.compare(password, user.password)) {
                // Возвращаем 401 Unauthorized для неверного пароля
                return next(ApiError.unauthorized('Неверный логин или пароль'))
            }

            const token = generateJwt(user.id, user.login)
            return res.json({ token })

        } catch (e) {
            console.error('LOGIN ERROR:', e)
            return next(ApiError.internal('Ошибка входа'))
        }
    }

    async check(req, res, next) {
        try {
            const token = generateJwt(req.user.id, req.user.login)
            return res.json({ token })
        } catch (e) {
            return next(ApiError.internal('Ошибка проверки токена'))
        }
    }

    async getMe(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'login', 'email']
            })
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'))
            }
            return res.json(user)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new UserController()