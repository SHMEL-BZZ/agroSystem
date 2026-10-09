// client/src/http/valveAPI.js
import { $authHost, $host } from './index';

export const fetchValves = async () => {
    const { data } = await $host.get('api/valve');
    return data;
};

export const fetchOneValve = async (id) => {
    const { data } = await $host.get(`api/valve/${id}`);
    return data;
};

export const createValve = async (payload) => {
    const { data } = await $authHost.post('api/valve', payload);
    return data;
};

export const updateValve = async (id, payload) => {
    const { data } = await $authHost.put(`api/valve/${id}`, payload);
    return data;
};

export const deleteValve = async (id) => {
    const { data } = await $authHost.delete(`api/valve/${id}`);
    return data;
};

export const linkGreenhouseToValve = async (valveId, payload) => {
    const { data } = await $authHost.post(`api/valve/${valveId}/greenhouses`, payload);
    return data;
};

export const unlinkGreenhouseFromValve = async (valveId, blockId) => {
    const { data } = await $authHost.delete(`api/valve/${valveId}/greenhouses/${blockId}`);
    return data;
};