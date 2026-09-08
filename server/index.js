// файл, с которого начинается запуск backend части.
// перед установкой зависимостей через npm необходимо скачать node.js https://nodejs.org/en/download
// npm run dev
// импорт файл с конфигами (.env)
require('dotenv').config();

// для импорта модулей в файл
const express = require('express');
const {Sequelize} = require("sequelize");
const sequelize = require("./db");

// порт, на котором работает backend часть
const PORT = process.env.PORT || 5000;

// вызов функции express для запуска приложения
const app = express();

// подключение к БД
const start = async () => {
    try {
        await sequelize.authenticate(); // вызов функции для подключения к базе данных
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.log(e)
    }
}

start();


