// Тесты сервиса авторизации (services/*) через HTTP. Модели замоканы в памяти.
const request = require('supertest');
const express = require('express');
const cookieParser = require('../middleware/cookieParser');

jest.mock('../models/models', () => {
    const makeStore = () => {
        const rows = [];
        let seq = 1;
        const matches = (row, where) => Object.entries(where || {}).every(([k, v]) => row[k] === v);
        return {
            rows,
            findOne: async ({ where }) => rows.find(r => matches(r, where)) || null,
            findByPk: async (id) => rows.find(r => r.id === id) || null,
            findAll: async () => rows.slice(),
            create: async (data) => {
                const row = { id: seq++, isActivated: false, ...data };
                row.save = async () => row;
                rows.push(row);
                return row;
            },
            destroy: async ({ where }) => {
                let n = 0;
                for (let i = rows.length - 1; i >= 0; i--) if (matches(rows[i], where)) { rows.splice(i, 1); n++; }
                return n;
            },
        };
    };
    return { User: makeStore(), Token: makeStore() };
});

const { User, Token } = require('../models/models');
const userRouter = require('../routes/userRouter');
const authMiddleware = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cookieParser);
app.use('/api/user', userRouter);
app.get('/api/protected', authMiddleware, (req, res) => res.json({ user: req.user }));
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));

const register = (body) => request(app).post('/api/user/register').send(body);

beforeEach(() => {
    User.rows.length = 0;
    Token.rows.length = 0;
    jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('POST /api/user/register', () => {
    it('400 — логин отсутствует / короче 3 / длиннее 50', async () => {
        for (const login of [undefined, 'ab', 'a'.repeat(51)]) {
            const res = await register({ login, password: '123456' });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Логин должен быть от 3 до 50 символов');
        }
        expect(User.rows).toHaveLength(0);
    });

    it('400 — пароль отсутствует / короче 6', async () => {
        for (const password of [undefined, '12345']) {
            const res = await register({ login: 'vasya', password });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Пароль должен быть минимум 6 символов');
        }
    });

    it('400 — невалидный, пустой и занятый email', async () => {
        expect((await register({ login: 'vasya', password: '123456', email: 'bad' })).body.message).toBe('Некорректный email');
        expect((await register({ login: 'vasya', password: '123456', email: '' })).body.message).toBe('Email не может быть пустым');
        await register({ login: 'first', password: '123456', email: 'a@b.ru' });
        const res = await register({ login: 'second', password: '123456', email: 'a@b.ru' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Пользователь с таким email уже существует');
    });

    it('400 — логин уже занят', async () => {
        await register({ login: 'vasya', password: '123456' });
        const res = await register({ login: 'vasya', password: '654321' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Пользователь с таким login уже существует');
    });

    it('201 — граничные длины, токены, refresh-cookie, пароль захеширован', async () => {
        const res = await register({ login: 'abc', password: '123456' });
        expect(res.status).toBe(201);
        expect(res.body.accessToken).toEqual(expect.any(String));
        expect(res.body.refreshToken).toEqual(expect.any(String));
        expect(res.body.user).toEqual({ id: 1, login: 'abc', email: null, isActivated: false });
        expect(res.headers['set-cookie'][0]).toMatch(/^refreshToken=.*HttpOnly/);
        expect(User.rows[0].password).not.toBe('123456');
        expect(User.rows[0].password).toHaveLength(60);
        expect(Token.rows).toHaveLength(1);
        expect((await register({ login: 'a'.repeat(50), password: '123456' })).status).toBe(201);
    });

    it('201 — с email создаётся ссылка активации, и активация работает', async () => {
        const res = await register({ login: 'vasya', password: '123456', email: 'v@x.ru' });
        expect(res.status).toBe(201);
        const link = User.rows[0].activationLink;
        expect(link).toEqual(expect.any(String));
        const act = await request(app).get('/api/user/activate/' + link);
        expect(act.status).toBe(302);
        expect(User.rows[0].isActivated).toBe(true);
        expect((await request(app).get('/api/user/activate/nope')).status).toBe(400);
    });
});

describe('POST /api/user/login', () => {
    beforeEach(() => register({ login: 'vasya', password: '123456', email: 'v@x.ru' }));

    it('вход по логину и по email', async () => {
        for (const body of [{ login: 'vasya' }, { email: 'v@x.ru' }]) {
            const res = await request(app).post('/api/user/login').send({ ...body, password: '123456' });
            expect(res.status).toBe(200);
            expect(res.body.user.login).toBe('vasya');
            expect(res.body.accessToken).toEqual(expect.any(String));
        }
    });

    it('400 — неверный пароль / несуществующий пользователь / пустое тело', async () => {
        expect((await request(app).post('/api/user/login').send({ login: 'vasya', password: 'wrong!' })).body.message).toBe('Неверный пароль');
        expect((await request(app).post('/api/user/login').send({ login: 'nobody', password: '123456' })).status).toBe(400);
        expect((await request(app).post('/api/user/login').send({})).status).toBe(400);
    });
});

describe('refresh / logout / защищённые маршруты', () => {
    it('защищённый маршрут: 401 без токена, 200 с access-токеном', async () => {
        expect((await request(app).get('/api/protected')).status).toBe(401);
        expect((await request(app).get('/api/protected').set('Authorization', 'Bearer garbage')).status).toBe(401);
        const { body } = await register({ login: 'vasya', password: '123456' });
        const res = await request(app).get('/api/protected').set('Authorization', 'Bearer ' + body.accessToken);
        expect(res.status).toBe(200);
        expect(res.body.user.login).toBe('vasya');
    });

    it('GET /users — только с токеном, без хешей паролей', async () => {
        expect((await request(app).get('/api/user/users')).status).toBe(401);
        const { body } = await register({ login: 'vasya', password: '123456' });
        const res = await request(app).get('/api/user/users').set('Authorization', 'Bearer ' + body.accessToken);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].password).toBeUndefined();
    });

    it('refresh по cookie выдаёт новые токены, без cookie — 401', async () => {
        expect((await request(app).post('/api/user/refresh')).status).toBe(401);
        const reg = await register({ login: 'vasya', password: '123456' });
        const res = await request(app).post('/api/user/refresh').set('Cookie', reg.headers['set-cookie'][0].split(';')[0]);
        expect(res.status).toBe(200);
        expect(res.body.user.login).toBe('vasya');
        expect(Token.rows).toHaveLength(1);
        expect(Token.rows[0].refreshToken).toBe(res.body.refreshToken);
    });

    it('logout удаляет refresh-токен, после чего refresh даёт 401', async () => {
        const reg = await register({ login: 'vasya', password: '123456' });
        const cookie = reg.headers['set-cookie'][0].split(';')[0];
        expect((await request(app).post('/api/user/logout').set('Cookie', cookie)).status).toBe(200);
        expect(Token.rows).toHaveLength(0);
        expect((await request(app).post('/api/user/refresh').set('Cookie', cookie)).status).toBe(401);
    });
});
