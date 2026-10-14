// test/test-registration.js
process.env.SECRET_KEY = 'test-secret-key';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const userRouter = require('../routes/userRouter');
const errorHandler = require('../middleware/ErrorHandlingMiddleware');

// Мок bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockImplementation((password, salt) => {
        // возвращаем строку длиной 60 символов, как настоящий bcrypt-хеш
        return Promise.resolve('$2b$10$' + 'a'.repeat(53));
    }),
    compare: jest.fn(),
}));

// Мок модель User
jest.mock('../models/models', () => ({
    User: {
        findOne: jest.fn(),
        create: jest.fn(),
    },
}));

// Мок ApiError
jest.mock('../error/ApiError', () => {
    return class ApiError extends Error {
        constructor(status, message) {
            super(message);
            this.status = status;
        }
        static badRequest(msg) { return new ApiError(400, msg); }
        static internal(msg) { return new ApiError(500, msg); }
        static notFound(msg) { return new ApiError(404, msg); }
    };
});

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);
app.use(errorHandler);

describe('POST /api/user/registration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    //  Валидация логина 
    describe('Валидация логина', () => {
        it('400 — если login отсутствует', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Логин должен быть от 3 до 50 символов');
            expect(User.findOne).not.toHaveBeenCalled();
            expect(User.create).not.toHaveBeenCalled();
        });

        it('400 — если login короче 3 символов', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'ab', password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Логин должен быть от 3 до 50 символов');
        });

        it('400 — если login длиннее 50 символов', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'a'.repeat(51), password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Логин должен быть от 3 до 50 символов');
        });

        it('200 — login ровно 3 символа (граница)', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 1, login: 'abc' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'abc', password: '123456' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('200 — login ровно 50 символов (граница)', async () => {
            const longLogin = 'a'.repeat(50);
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 2, login: longLogin });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: longLogin, password: '123456' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    //  Валидация пароля 
    describe('Валидация пароля', () => {
        it('400 — если password отсутствует', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пароль должен быть минимум 6 символов');
            expect(User.findOne).not.toHaveBeenCalled();
            expect(User.create).not.toHaveBeenCalled();
        });

        it('400 — если password короче 6 символов', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '12345' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пароль должен быть минимум 6 символов');
        });

        it('200 — password ровно 6 символов (граница)', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 3, login: 'vasya' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    //  Email 
    describe('Валидация email', () => {
        it('400 — невалидный email', async () => {
            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456', email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Некорректный email');
        });

        it('400 — email уже существует', async () => {
            User.findOne
                .mockResolvedValueOnce({ id: 10, email: 'existing@example.com' })
                .mockResolvedValueOnce(null);

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456', email: 'existing@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пользователь с таким email уже существует');
            expect(User.create).not.toHaveBeenCalled();
        });

        it('200 — валидный уникальный email', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 4, login: 'vasya', email: 'new@example.com' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456', email: 'new@example.com' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    //  Уникальность login 
    describe('Уникальность login', () => {
        it('400 — login уже существует', async () => {
            User.findOne.mockResolvedValue({ id: 1, login: 'vasya' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пользователь с таким login уже существует');
            expect(User.create).not.toHaveBeenCalled();
        });
    });

    //  Успешная регистрация 
    describe('Успешная регистрация', () => {
        it('200 — возвращает JWT и сохраняет хешированный пароль', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 42, login: 'vasya' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');

            expect(User.create).toHaveBeenCalledTimes(1);
            const createArg = User.create.mock.calls[0][0];
            expect(createArg.login).toBe('vasya');
            expect(createArg.password).not.toBe('123456');
            expect(createArg.password.length).toBe(60);
        });

        it('200 — токен валиден и содержит id/login', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ id: 7, login: 'petya' });

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'petya', password: 'qwerty' });

            const decoded = jwt.verify(res.body.token, process.env.SECRET_KEY);
            expect(decoded.id).toBe(7);
            expect(decoded.login).toBe('petya');
        });
    });

    //  Ошибки сервера 
    describe('Ошибки сервера', () => {
        it('500 — если User.findOne падает', async () => {
            User.findOne.mockRejectedValue(new Error('DB is down'));

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456' });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ошибка регистрации');
        });

        it('500 — если User.create падает', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockRejectedValue(new Error('DB is down'));

            const res = await request(app)
                .post('/api/user/registration')
                .send({ login: 'vasya', password: '123456' });

            expect(res.status).toBe(500);
            expect(res.body.message).toBe('Ошибка регистрации');
        });
    });
});