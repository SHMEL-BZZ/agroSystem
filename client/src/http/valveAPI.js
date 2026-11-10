import { $authHost } from './index';
import { ENDPOINTS } from '../config/api';

// Получить все клапаны (теперь требует токен, поэтому $authHost)
export const fetchValves = async () => {
    // Убрали 'api/' в начале, так как базовый URL уже содержит /api
    const { data } = await $authHost.get(ENDPOINTS.valves);
    return data;
};

// Получить один клапан по id
export const fetchOneValve = async (id) => {
    const { data } = await $authHost.get(`${ENDPOINTS.valves}/${id}`);
    return data;
};

// Привязать теплицу к клапану
export const linkGreenhouseToValve = async (valveId, payload) => {
    const { data } = await $authHost.post(`${ENDPOINTS.valves}/${valveId}/greenhouses`, payload);
    return data;
};

// Отвязать теплицу от клапана
export const unlinkGreenhouseFromValve = async (valveId, blockId) => {
    const { data } = await $authHost.delete(`${ENDPOINTS.valves}/${valveId}/greenhouses/${blockId}`);
    return data;
};