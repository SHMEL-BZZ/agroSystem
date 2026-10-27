const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Чтобы принимать JSON в теле запроса

// Роуты
app.use('/', authRoutes);

// Запуск сервера
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Подключение к базе watering_auth успешно.');

        // Синхронизация модели с БД (создаст таблицу users, если её нет)
        await sequelize.sync({ alter: true });
        console.log('Таблицы синхронизированы.');

        app.listen(PORT, () => {
            console.log(`Auth Service запущен на порту ${PORT}`);
        });
    } catch (error) {
        console.error('Ошибка запуска Auth Service:', error);
    }
};

startServer();