// client/src/api/wateringApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const wateringApi = {
    getAll: () => http.get(ENDPOINTS.watering),

    getById: (id) => http.get(`${ENDPOINTS.watering}/${id}`),

    create: (data) => http.post(ENDPOINTS.watering, data),

    update: (id, data) => http.put(`${ENDPOINTS.watering}/${id}`, data),

    remove: (id) => http.delete(`${ENDPOINTS.watering}/${id}`),

    // История поливов по клапану
    getByValve: (valveId) =>
        http.get(`${ENDPOINTS.watering}/valve/${valveId}`),

    // История поливов по дню
    getByDate: (date) => http.get(`${ENDPOINTS.watering}/date/${date}`),

    // Сохранить настройки полива (периоды + распределение + клапаны)
    saveSchedule: (data) => http.post(`${ENDPOINTS.watering}/schedule`, data),

    // Запустить полив вручную
    start: (id) => http.post(`${ENDPOINTS.watering}/${id}/start`),

    // Остановить полив
    stop: (id) => http.post(`${ENDPOINTS.watering}/${id}/stop`),

    // Дренаж для конкретного полива
    getDrains: (id) => http.get(`${ENDPOINTS.watering}/${id}/drains`),
};