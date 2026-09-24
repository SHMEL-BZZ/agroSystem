// client/src/api/valvesApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const valvesApi = {
    getAll: () => http.get(ENDPOINTS.valves),

    getById: (id) => http.get(`${ENDPOINTS.valves}/${id}`),

    create: (data) => http.post(ENDPOINTS.valves, data),

    update: (id, data) => http.put(`${ENDPOINTS.valves}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.valves}/${id}`),

    // Пример специфичного метода:
    setState: (id, state) =>
        http.patch(`${ENDPOINTS.valves}/${id}/state`, { state }),

    getGreenhouses: (id) =>
        http.get(`${ENDPOINTS.valves}/${id}/greenhouses`),
};