const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Генерация токена
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Регистрация
exports.register = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Проверка, существует ли пользователь
        const userExists = await User.findOne({ where: { login } });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
        }

        // Создание пользователя (пароль захэшируется в хуке beforeCreate)
        const user = await User.create({ login, password });

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при регистрации', error: error.message });
    }
};

// Вход
exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Ищем пользователя
        const user = await User.findOne({ where: { login } });
        if (!user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        // Проверяем пароль
        const isMatch = await user.validPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        res.status(200).json({
            message: 'Успешный вход',
            token: generateToken(user.id),
            userId: user.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при входе', error: error.message });
    }
};