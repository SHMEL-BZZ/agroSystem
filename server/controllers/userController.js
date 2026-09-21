const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../models/models')

// генерация токена
const generateJwt = (id, login) => {
    return jwt.sign(
        { id, login },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

class UserController {

    // регистрация (по login, password и email)
    async registration(req, res, next) {
        try {
            const { login, password, email } = req.body

            // --- Валидация ---
            if (!login || login.length < 3 || login.length > 50) {
                return next(ApiError.badRequest('Логин должен быть от 3 до 50 символов'))
            }
            if (!password || password.length < 6) {
                return next(ApiError.badRequest('Пароль должен быть минимум 6 символов'))
            }

            // Email необязателен, но если передан — проверяем формат
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(email)) {
                    return next(ApiError.badRequest('Некорректный email'))
                }

                // Проверка уникальности email
                const existingEmail = await User.findOne({ where: { email } })
                if (existingEmail) {
                    return next(ApiError.badRequest('Пользователь с таким email уже существует'))
                }
            }

            // Проверка уникальности login
            const candidate = await User.findOne({ where: { login } })
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким login уже существует'))
            }

            // --- Создание ---
            const hashPassword = await bcrypt.hash(password, 10)
            const user = await User.create({
                login,
                password: hashPassword,
                email        // может быть undefined — тогда в БД будет NULL
            })

            const token = generateJwt(user.id, user.login)
            return res.json({ token })

        } catch (e) {
            console.error('REGISTRATION ERROR:', e)
            return next(ApiError.internal('Ошибка регистрации'))
        }
    }

    // вход (по login и паролю)
    async login(req, res, next) {
        try {
            const { login, password } = req.body

            if (!login || !password) {
                return next(ApiError.badRequest('Логин и пароль обязательны'))
            }

            const user = await User.findOne({ where: { login } })

            // Не говорим, что именно неверно — безопасность
            if (!user || !await bcrypt.compare(password, user.password)) {
                return next(ApiError.badRequest('Неверный логин или пароль'))
            }

            const token = generateJwt(user.id, user.login)
            return res.json({ token })

        } catch (e) {
            console.error('LOGIN ERROR:', e)
            return next(ApiError.internal('Ошибка входа'))
        }
    }

    // проверка валидности токена (обновление/продление сессии)
    async check(req, res, next) {
        try {
            const token = generateJwt(req.user.id, req.user.login)
            return res.json({ token })
        } catch (e) {
            return next(ApiError.internal('Ошибка проверки токена'))
        }
    }

    // получить данные текущего пользователя (включая email)
    async getMe(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'login', 'email']  // без пароля!
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