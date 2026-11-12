const express = require('express');
const sequelize = require('./db');
require('./models/models');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
require('dotenv').config();
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors(require('./middleware/corsOptions')));
app.use(express.json());
app.use(fileUpload());

// Вход/регистрация живут в отдельном Auth Service; здесь — только проверка access-токена
app.use('/api', authMiddleware, router);

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

module.exports = app;

if (require.main === module) {
    const start = async () => {
        try {
            await sequelize.authenticate();
            console.log('Подключение к базе watering успешно.');

            await sequelize.sync();

            app.listen(PORT, () => console.log(`Core Service запущен на порту ${PORT}`));

            const cron = require('node-cron');
            cron.schedule('* * * * *', async () => {
            });
        } catch (e) {
            console.log('Ошибка запуска Core Service:', e);
        }
    };
    start();
}