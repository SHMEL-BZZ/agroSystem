// client/src/api/drainApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const drainApi = {
    getAll: () => http.get(ENDPOINTS.drain),

    getById: (id) => http.get(`${ENDPOINTS.drain}/${id}`),

    create: (data) => http.post(ENDPOINTS.drain, data),

    update: (id, data) => http.put(`${ENDPOINTS.drain}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.drain}/${id}`),

    // Дренаж по конкретному поливу
    getByWatering: (wateringId) =>
        http.get(`${ENDPOINTS.drain}/watering/${wateringId}`),

    // Дренаж за период
    getByDateRange: (from, to) =>
        http.get(`${ENDPOINTS.drain}/range`, {
            params: { from, to },
        }),

    // Сгенерировать данные дренажа (Python-скрипт)
    generate: (wateringId) =>
        http.post(`${ENDPOINTS.drain}/generate`, { wateringId }),
};