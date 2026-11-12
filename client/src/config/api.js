const withApi = (url) => url.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

export const API_BASE_URL = withApi(
    process.env.REACT_APP_API_URL || 'http://localhost:5000'
);

export const AUTH_BASE_URL = withApi(
    process.env.REACT_APP_AUTH_URL || 'http://localhost:5001'
);

export const ENDPOINTS = {
    auth: {
        login: '/user/login',
        register: '/user/register',
        refresh: '/user/refresh',
        logout: '/user/logout',
        resendActivation: '/user/resend-activation',
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
