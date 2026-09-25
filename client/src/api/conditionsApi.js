// client/src/api/conditionsApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const conditionsApi = {
    getAll: () => http.get(ENDPOINTS.conditions),

    getById: (id) => http.get(`${ENDPOINTS.conditions}/${id}`),

    create: (data) => http.post(ENDPOINTS.conditions, data),

    update: (id, data) => http.put(`${ENDPOINTS.conditions}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.conditions}/${id}`),

    // Условия по клапану
    getByValve: (valveId) =>
        http.get(`${ENDPOINTS.conditions}/valve/${valveId}`),

    // Условия по дате
    getByDate: (date) => http.get(`${ENDPOINTS.conditions}/date/${date}`),

    // Условия по клапану и дате
    getByValveAndDate: (valveId, date) =>
        http.get(`${ENDPOINTS.conditions}/valve/${valveId}/date/${date}`),

    // Сгенерировать условия на дату (Python-скрипт)
    generate: (valveId, date, season) =>
        http.post(`${ENDPOINTS.conditions}/generate`, {
            valveId,
            date,
            season,
        }),
};