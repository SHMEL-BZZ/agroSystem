const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const jwt = require('jsonwebtoken'); // Добавляем для проверки токенов
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// =====================================================================
// MIDDLEWARE ДЛЯ ПРОВЕРКИ JWT-ТОКЕНА
// =====================================================================
const authMiddleware = (req, res, next) => {
    let token;

    // 1. Ищем токен в заголовках (как это делает фронтенд или Postman)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
   

    // Если токена нет ни там, ни там — запрещаем
    if (!token) {
        return res.status(401).json({ message: 'Доступ запрещен. Нет токена авторизации.' });
    }

    try {
        // 3. Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_agro');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Неверный или истекший токен.' });
    }
};
// =====================================================================
// ПОДКЛЮЧЕНИЕ РОУТОВ
// =====================================================================
// Защищаем все роуты через authMiddleware.
// Если в вашем роутере есть публичные пути, их нужно будет вынести выше.
app.use('/api', authMiddleware, router);

// =====================================================================
// ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК
// =====================================================================
app.use((err, req, res, next) => {
    console.log('Error:', err.status, err.message);
    if (err.status) {
        return res.status(err.status).json({ message: err.message });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Такая запись уже существует' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Экспортируем app для тестов
module.exports = app;

// =====================================================================
// ЗАПУСК СЕРВЕРА
// =====================================================================
if (require.main === module) {
    const start = async () => {
        try {
            await sequelize.authenticate();
            console.log('Подключение к базе watering успешно.');

            // ВАЖНО: sync() лучше не использовать в продакшене, 
            // но для учебного проекта оставим (или используйте миграции)
            await sequelize.sync();

            app.listen(PORT, () => console.log(`Core Service запущен на порту ${PORT}`));

            // Ваш cron (если он нужен)
            const cron = require('node-cron');
            cron.schedule('* * * * *', async () => {
                // ваша логика
            });
        } catch (e) {
            console.log('Ошибка запуска Core Service:', e);
        }
    };
    start();
}