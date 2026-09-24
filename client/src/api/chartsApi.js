import { http } from './http';

export const chartsApi = {
    // type — 'drainage' | 'ec-ph' | 'watering' | ...
    // params — { from: '2026-09-15', to: '2026-09-21' }
    getData: (type, params) => {
        const query = new URLSearchParams(params).toString();
        return http.get(`/charts/${type}?${query}`);
    },
};