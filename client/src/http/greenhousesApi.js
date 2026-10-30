// client/src/http/greenhousesApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const greenhousesApi = {
    getAll: () => http.get(ENDPOINTS.greenhouses),

    getById: (id) => http.get(`${ENDPOINTS.greenhouses}/${id}`),

    create: (data) => http.post(ENDPOINTS.greenhouses, data),

    update: (id, data) => http.put(`${ENDPOINTS.greenhouses}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.greenhouses}/${id}`),

    // Теплицы, привязанные к конкретному клапану
    getByValve: (valveId) =>
        http.get(`${ENDPOINTS.greenhouses}/valve/${valveId}`),

    // Свободные теплицы (не привязанные ни к одному клапану)
    getFree: () => http.get(`${ENDPOINTS.greenhouses}/free`),

    // Привязать теплицу к клапану
    attachToValve: (greenhouseId, valveId) =>
        http.post(`${ENDPOINTS.greenhouses}/${greenhouseId}/valve`, {
            valveId,
        }),

    // Отвязать теплицу от клапана
    detachFromValve: (greenhouseId) =>
        http.delete(`${ENDPOINTS.greenhouses}/${greenhouseId}/valve`),
};