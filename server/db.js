// файл для взаимодействия с базой данных (берет данные из .env)
require('dotenv').config()  

const { Sequelize } = require('sequelize')

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        logging: false,
    }
)