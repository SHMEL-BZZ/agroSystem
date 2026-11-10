const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,      // watering_auth
    process.env.DB_USERNAME,  // auth_user
    process.env.DB_PASSWORD,  // AuthPassword2026!
    {
        host: process.env.DB_HOST, // Margo
        port: process.env.DB_PORT, // 5432
        dialect: 'postgres',
        logging: false,
    }
);

module.exports = sequelize;