// client/src/api/tanksApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const tanksApi = {
    getAll: () => http.get(ENDPOINTS.tanks),

    getById: (id) => http.get(`${ENDPOINTS.tanks}/${id}`),

    create: (data) => http.post(ENDPOINTS.tanks, data),

    update: (id, data) => http.put(`${ENDPOINTS.tanks}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.tanks}/${id}`),

    // Баки по назначению (чистая вода / питательный раствор / дренаж)
    getByPurpose: (purposeId) =>
        http.get(`${ENDPOINTS.tanks}/purpose/${purposeId}`),

    // Изменить объём бака
    setVolume: (id, volume) =>
        http.patch(`${ENDPOINTS.tanks}/${id}/volume`, { volume }),

    // История растворов для бака
    getSolutions: (id) => http.get(`${ENDPOINTS.tanks}/${id}/solutions`),
};