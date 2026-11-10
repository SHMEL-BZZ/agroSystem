const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Генерация токена
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Регистрация
exports.register = async (req, res) => {
    try {
        // ВАЖНО: Достаем email из тела запроса
        const { login, password, email } = req.body;

        // Проверка, существует ли пользователь
        const userExists = await User.findOne({ where: { login } });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
        }

        // Создание пользователя (пароль захэшируется в хуке beforeCreate)
        // ВАЖНО: Передаем email при создании
        const user = await User.create({ login, password, email });

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
            console.log('Пользователь не найден');
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        console.log('Хэш из БД:', user.password);

        // Проверяем пароль
        const isMatch = await user.validPassword(password);
        console.log('Пароль совпал?', isMatch);

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