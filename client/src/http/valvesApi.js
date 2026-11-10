// client/src/http/valvesApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const valvesApi = {
    getAll: () => http.get(ENDPOINTS.valves),

    getById: (id) => http.get(`${ENDPOINTS.valves}/${id}`),

    create: (data) => http.post(ENDPOINTS.valves, data),

    update: (id, data) => http.put(`${ENDPOINTS.valves}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.valves}/${id}`),

    // Изменить состояние клапана
    setState: (id, state) =>
        http.patch(`${ENDPOINTS.valves}/${id}/state`, { state }),

    // Теплицы, привязанные к клапану
    getGreenhouses: (id) =>
        http.get(`${ENDPOINTS.valves}/${id}/greenhouses`),

    // Привязать теплицу к клапану
    // payload = { blockId } для существующей, либо { name, description } для новой
    linkGreenhouse: (valveId, payload) =>
        http.post(`${ENDPOINTS.valves}/${valveId}/greenhouses`, payload),

    // Отвязать теплицу от клапана
    unlinkGreenhouse: (valveId, blockId) =>
        http.delete(`${ENDPOINTS.valves}/${valveId}/greenhouses/${blockId}`),
};
