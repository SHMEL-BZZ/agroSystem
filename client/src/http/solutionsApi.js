// client/src/http/solutionsApi.js
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

// История замесов (журнал растворов по бакам)
export const solutionHistoryApi = {
    // Замесы конкретного бака
    getByTank: (tankId, limit = 200) =>
        http.get(ENDPOINTS.solutionHistory, { params: { tankId, limit } }),

    create: ({ tankId, totalVolume, date }) =>
        http.post(ENDPOINTS.solutionHistory, { tankId, totalVolume, date }),

    clearTank: (tankId) =>
        http.post(`${ENDPOINTS.solutionHistory}/${tankId}/clear`),
};

// Состав замеса (добавки и их количество)
export const solutionCompositionApi = {
    getBySolution: (solutionId) =>
        http.get(ENDPOINTS.solutionComposition, { params: { solutionId } }),

    create: ({ solutionId, additiveId, amount, unit }) =>
        http.post(ENDPOINTS.solutionComposition, {
            solutionId,
            additiveId,
            amount,
            unit,
        }),
};
