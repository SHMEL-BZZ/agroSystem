// файл, с которого начинается запуск backend части.
// перед установкой зависимостей через npm необходимо скачать node.js https://nodejs.org/en/download
// npm run dev

// импорт файл с конфигами (.env)
require('dotenv').config();

// для импорта модулей в файл
const express = require('express');
const {Sequelize} = require("sequelize");
const sequelize = require("./db");
const models = require("./models/models.js");
const cors = require('cors');
// порт, на котором работает backend часть
const PORT = process.env.PORT || 5000;

// вызов функции express для запуска приложения
const app = express();
//app.use(cors())
//app.use(express.json())

/*app.get('/', (req, res) => {
    res.status(200).json({message:'Работает'})
})*/

// подключение к БД
const start = async () => {
    try {
        await sequelize.authenticate(); // вызов функции для подключения к базе данных
        await sequelize.sync() // сверяет бд и данные с приложения
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.log(e)
    }
}

start();


