const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_пользователя' // <-- Привязка к русскому полю
    },
    login: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'логин' // <-- Привязка к русскому полю
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'пароль' // <-- Привязка к русскому полю
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'почта' // <-- Привязка к русскому полю
    }
}, {
    tableName: 'пользователи',
    timestamps: false, // <-- ВАЖНО! Отключаем createdAt и updatedAt, так как их нет в таблице
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

User.prototype.validPassword = async function (password) {
    console.log('--- ПРОВЕРКА ПАРОЛЯ ---');
    console.log('1. Пароль, который ввел пользователь (из формы):', password);
    console.log('2. Хэш, который лежит в базе:', this.password);

    // Пробуем сравнить
    const result = await bcrypt.compare(password, this.password);
    console.log('3. Результат сравнения:', result);

    return result;
};

module.exports = User;