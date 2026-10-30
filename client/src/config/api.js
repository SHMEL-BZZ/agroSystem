// client/src/config/api.js

// Базовый URL сервера (API Gateway).
export const API_BASE_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Все эндпоинты в одном месте — чтобы не искать строки по коду
export const ENDPOINTS = {
    auth: {
        login: '/auth/login',
        register: '/auth/register',
        check: '/auth/check',
    },
    valves: '/valve',
    greenhouses: '/greenhouse',
    tanks: '/tank',
    additives: '/additive',
    solutions: '/solution',
    solutionHistory: '/solution-history', // Добавили из ветки напарницы
    solutionComposition: '/solution-composition',
    watering: '/watering',
    conditions: '/condition',
    drain: '/drain',
    charts: '/charts',
    generators: '/generators',
    wateringSchedule: '/watering-schedule',
};