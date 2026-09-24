// client/src/api/additivesApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const additivesApi = {
    getAll: () => http.get(ENDPOINTS.additives),

    getById: (id) => http.get(`${ENDPOINTS.additives}/${id}`),

    create: (data) => http.post(ENDPOINTS.additives, data),

    update: (id, data) => http.put(`${ENDPOINTS.additives}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.additives}/${id}`),

    // ѕополнить остаток добавки
    refill: (id, amount) =>
        http.patch(`${ENDPOINTS.additives}/${id}/refill`, { amount }),

    // ¬се составы растворов, где использовалась добавка
    getUsages: (id) => http.get(`${ENDPOINTS.additives}/${id}/usages`),
};