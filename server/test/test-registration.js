// Тесты эндпоинта POST /api/user/registration
// мок моделей User и ApiError чтобы не ходить в БД и не зависеть
// от реального класса ошибок.
process.env.SECRET_KEY = 'test-secret-key'
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('../models/models')
const userRouter = require('../routes/userRouter')
const errorHandler = require('../middleware/ErrorHandlingMiddleware')



jest.mock('../models/models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}))

jest.mock('../error/ApiError', () => {
    return class ApiError extends Error {
        constructor(status, message) {
            super(message)
            this.status = status
        }
        static badRequest(msg) { return new ApiError(400, msg) }
        static internal(msg)   { return new ApiError(500, msg) }
    }
})

// минимальное express-приложение с тестируемым роутером
const app = express()
app.use(express.json())
app.use('/api/user', userRouter)
app.use(errorHandler)


// тесты
describe('POST /api/user/registration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('400 — если не передан login или password', async () => {
        const res = await request(app)
            .post('/api/user/registration')
            .send({ login: 'vasya' }) // пароля нет

        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/Некорректный/)
        expect(User.findOne).not.toHaveBeenCalled()
        expect(User.create).not.toHaveBeenCalled()
    })

    it('400 — если пользователь с таким login уже существует', async () => {
        User.findOne.mockResolvedValue({ id: 1, login: 'vasya' })

        const res = await request(app)
            .post('/api/user/registration')
            .send({ login: 'vasya', password: '12345' })

        expect(res.status).toBe(400)
        expect(res.body.message).toMatch(/уже существует/)
        expect(User.create).not.toHaveBeenCalled()
    })

    it('200 — успешная регистрация, возвращает JWT', async () => {
        User.findOne.mockResolvedValue(null)
        User.create.mockResolvedValue({ id: 42, login: 'vasya' })

        const res = await request(app)
            .post('/api/user/registration')
            .send({ login: 'vasya', password: '12345' })

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('token')
        expect(typeof res.body.token).toBe('string')

        // пароль должен сохраняться хешированным
        expect(User.create).toHaveBeenCalledTimes(1)
        const arg = User.create.mock.calls[0][0]
        expect(arg.login).toBe('vasya')
        expect(arg.password).not.toBe('12345')
        expect(arg.password.length).toBeGreaterThan(20) // bcrypt-хеш длиной 60
    })

    it('200 — токен валиден и содержит id/login', async () => {
        User.findOne.mockResolvedValue(null)
        User.create.mockResolvedValue({ id: 7, login: 'petya' })

        const res = await request(app)
            .post('/api/user/registration')
            .send({ login: 'petya', password: 'qwerty' })

        const decoded = jwt.verify(res.body.token, process.env.SECRET_KEY)
        expect(decoded.id).toBe(7)
        expect(decoded.login).toBe('petya')
    })

    it('500 — если User.create падает', async () => {
        User.findOne.mockResolvedValue(null)
        User.create.mockRejectedValue(new Error('DB is down'))

        const res = await request(app)
            .post('/api/user/registration')
            .send({ login: 'vasya', password: '12345' })

        expect(res.status).toBe(500)
        expect(res.body.message).toBe('Непредвиденная ошибка!')
    })
})