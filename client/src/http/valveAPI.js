import { $authHost, $host } from './index';

// Получить все клапаны
export const fetchValves = async () => {
    const { data } = await $host.get('api/valve');
    return data;
};

// Получить один клапан по id
export const fetchOneValve = async (id) => {
    const { data } = await $host.get(`api/valve/${id}`);
    return data;
};

// Привязать теплицу к клапану
// payload = { blockId } для существующей, либо { name, description } для новой
export const linkGreenhouseToValve = async (valveId, payload) => {
    const { data } = await $authHost.post(`api/valve/${valveId}/greenhouses`, payload);
    return data;
};

// Отвязать теплицу от клапана
export const unlinkGreenhouseFromValve = async (valveId, blockId) => {
    const { data } = await $authHost.delete(`api/valve/${valveId}/greenhouses/${blockId}`);
    return data;
};