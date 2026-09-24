// client/src/api/solutionsApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const solutionsApi = {
    getAll: () => http.get(ENDPOINTS.solutions),

    getById: (id) => http.get(`${ENDPOINTS.solutions}/${id}`),

    create: (data) => http.post(ENDPOINTS.solutions, data),

    update: (id, data) => http.put(`${ENDPOINTS.solutions}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.solutions}/${id}`),

    // История растворов по баку
    getByTank: (tankId) =>
        http.get(`${ENDPOINTS.solutions}/tank/${tankId}`),

    // История растворов за период
    getByDateRange: (from, to) =>
        http.get(`${ENDPOINTS.solutions}/range`, {
            params: { from, to },
        }),

    // Состав конкретного раствора
    getComposition: (id) =>
        http.get(`${ENDPOINTS.solutions}/${id}/composition`),

    // Добавить добавку в раствор
    addCompositionItem: (id, additiveId, amount, unit) =>
        http.post(`${ENDPOINTS.solutions}/${id}/composition`, {
            additiveId,
            amount,
            unit,
        }),

    // Удалить добавку из состава
    removeCompositionItem: (id, itemId) =>
        http.delete(`${ENDPOINTS.solutions}/${id}/composition/${itemId}`),
};