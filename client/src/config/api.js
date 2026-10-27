// client/src/config/api.js

// Базовый URL сервера (теперь это API Gateway).
export const API_BASE_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Все эндпоинты в одном месте — чтобы не искать строки по коду
export const ENDPOINTS = {
    auth: {
        // Пути изменились, так как теперь это отдельный микросервис
        login: '/auth/login',
        register: '/auth/register',
        // Проверка токена (если она нужна) теперь делается на клиенте 
        // или через отдельный эндпоинт, которого пока нет. 
        // Оставим его, но он может не работать, пока мы его не создадим.
        check: '/auth/check',
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
    generators: '/generators',
    wateringSchedule: '/watering-schedule',
};