// client/src/config/api.js

// Базовый URL сервера.
// В dev-режиме — localhost, в продакшене — реальный домен.
export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Все эндпоинты в одном месте — чтобы не искать строки по коду
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
    solutionHistory: '/solution-history',
    solutionComposition: '/solution-composition',
    watering: '/watering',
    conditions: '/condition',
    drain: '/drain',
    charts: '/charts',
    generators: '/generators',
    wateringSchedule: '/watering-schedule',
};
