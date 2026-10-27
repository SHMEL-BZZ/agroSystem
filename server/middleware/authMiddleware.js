const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    // Берем токен из заголовка Authorization (формат: "Bearer <токен>")
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Нет токена, доступ запрещен' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Проверяем токен тем же секретным ключом, что и Auth Service!
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_agro');
        req.user = decoded; // Сохраняем данные пользователя в запрос
        next(); // Пропускаем запрос дальше
    } catch (error) {
        return res.status(401).json({ message: 'Неверный или истекший токен' });
    }
};