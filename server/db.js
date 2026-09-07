// файл для взаимодействия с базой данных (берет данные из .env)
const {Sequelize} = require('sequelize');

module.exports = new Sequelize (
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        logging: false,
    }
)