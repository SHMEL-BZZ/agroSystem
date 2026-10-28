// client/src/http/generatorsApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const generatorsApi = {
    // Список доступных генераторов
    list: () => http.get(ENDPOINTS.generators),

    // Запустить генератор
    run: (name) => http.post(`${ENDPOINTS.generators}/${name}/run`),

    // Статус запуска
    status: (name) => http.get(`${ENDPOINTS.generators}/${name}/status`),

    // Данные генератора за дату (date — 'YYYY-MM-DD')
    data: (name, date) =>
        http.get(`${ENDPOINTS.generators}/${name}/data`, { params: { date } }),
};
