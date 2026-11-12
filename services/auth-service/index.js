require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db')
require('./models/models')
const cookieParser = require('./middleware/cookieParser')
const userRouter = require('./routes/userRouter')

const app = express()
const PORT = process.env.AUTH_PORT || 5001

app.use(cors(require('./middleware/corsOptions')))
app.use(express.json())
app.use(cookieParser)

app.use('/api/user', userRouter)

app.use((err, req, res, next) => {
    if (err.status) {
        return res.status(err.status).json({ message: err.message, code: err.code, email: err.email })
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Такая запись уже существует' })
    }
    console.error(err)
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' })
})

module.exports = app

if (require.main === module) {
    const start = async () => {
        try {
            await sequelize.authenticate()
            console.log('Auth Service: подключение к базе успешно.')
            await sequelize.sync()
            app.listen(PORT, () => console.log(`Auth Service запущен на порту ${PORT}`))
        } catch (e) {
            console.error('Ошибка запуска Auth Service:', e)
            process.exit(1)
        }
    }
    start()
}