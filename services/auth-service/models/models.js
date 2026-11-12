const sequelize = require('../db')
const { DataTypes } = require('sequelize')

// модели
// пользователи
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_пользователя'
    },
    login: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'логин'
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'пароль'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'почта'
    },
    isActivated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'активирован'
    },
    activationLink: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'ссылка_активации'
    }
}, {
    tableName: 'пользователи',
    timestamps: false
})

// токены
const Token = sequelize.define('Token', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id_токена'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'id_пользователя',
        references: {
            model: User,
            key: 'id_пользователя'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    refreshToken: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'refresh_токен'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'дата_добавления'
    }
}, {
    tableName: 'токены',
    timestamps: false
})

module.exports = { sequelize, User, Token }
