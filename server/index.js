const express = require('express');
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/api', router);
// Глобальный обработчик ошибок (должен идти ПОСЛЕ всех роутов)
// Глобальный обработчик ошибок
app.use('/api', router);

// ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК (должен идти после всех роутов!)
app.use((err, req, res, next) => {
    console.log('Error:', err.status, err.message); // для отладки
    if (err.status) {
        return res.status(err.status).json({ message: err.message });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Пользователь с таким логином или email уже существует' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});
// Экспортируем app для тестов
module.exports = app;

// Запускаем сервер только при прямом запуске
if (require.main === module) {
    const start = async () => {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

            const cron = require('node-cron');
            cron.schedule('* * * * *', async () => {
                // ваша логика
            });
        } catch (e) {
            console.log(e);
        }
    };
    start();
}