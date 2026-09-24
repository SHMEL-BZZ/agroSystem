// client/src/config/api.js

// Ѕазовый URL сервера.
// ¬ dev-режиме Ч localhost, в продакшене Ч реальный домен.
export const API_BASE_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ¬се эндпоинты в одном месте Ч чтобы не искать строки по коду
export const ENDPOINTS = {
    auth: {
        login: '/user/login',
        register: '/user/registration',
        check: '/user/auth',
    },
    valves: '/valve',
    greenhouses: '/greenhouse',
    tanks: '/tank',
    additives: '/additive',
    solutions: '/solution',
    watering: '/watering',
    conditions: '/condition',
    drain: '/drain',
    charts: '/charts',
};