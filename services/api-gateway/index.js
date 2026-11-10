const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

// 1. Auth Service (порт 3001)
app.use('/api/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '', // Отрезаем префикс для Auth Service
    },
}));

// 2. Core Service (порт 5000)
// Используем функцию для проверки пути, чтобы библиотека не "съедала" /api
app.use(createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathFilter: '/api', // Явно указываем, что проксируем только пути с /api
    // Мы НЕ используем pathRewrite, чтобы /api остался в пути
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway работает на порту ${PORT}`);
});