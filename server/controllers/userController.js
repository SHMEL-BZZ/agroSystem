const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User} = require('../models/models')

// генерация токена (по id, login, ключу, длительность: 24ч)
const generateJwt = (id, login) => {
    return jwt.sign(
        { id, login },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

class UserController {
    // регистрация (по login и паролю)
    async registration(req, res, next) {
        const { login, password } = req.body
        if (!login || !password) {
            return next(ApiError.badRequest('Некорректный login или password'))
        }
        const candidate = await User.findOne({ where: { login } })
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким login уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({ login, password: hashPassword })
        const token = generateJwt(user.id, user.login)
        return res.json({ token })
    }

    // вход (по login и паролю)
    async login(req, res, next)
    {
        try{
            const { login, password } = req.body
            const user = await User.findOne({ where: { login } })
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'))
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return next(ApiError.internal('Указан неверный пароль'))
            }
            const token = generateJwt(user.id, user.login)
            return res.json({ token })
        } catch (e) {
            console.log('REGISTRATION ERROR:', e)
            next(e)
        }
    }

    // проверка валидности токена (обновление/продление сессии)
    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.login)
        return res.json({ token })
    }
}

module.exports = new UserController()