require('dotenv').config()
const { Sequelize } = require('sequelize')

const isTest = process.env.NODE_ENV === 'test'

module.exports = isTest
    ? new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
    })
    : new Sequelize(
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