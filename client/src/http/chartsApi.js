// client/src/http/chartsApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const chartsApi = {
    // Данные графика за период
    getData: async (chartId, { dateFrom, dateTo } = {}) => {
        const response = await http.get(`${ENDPOINTS.charts}/${chartId}`, {
            params: { dateFrom, dateTo },
        });
        return response.data;
    },

    // Диапазон дат, за который есть данные
    getAvailableRange: () => http.get(`${ENDPOINTS.charts}/available-range`),
};
