import { $authHost, $host } from './index';

// Получить все теплицы (с включёнными клапанами, чтобы знать связи)
export const fetchGreenhouses = async () => {
    const { data } = await $host.get('api/greenhouse');
    return data;
};

// Получить одну теплицу
export const fetchOneGreenhouse = async (id) => {
    const { data } = await $host.get(`api/greenhouse/${id}`);
    return data;
};

// Создать новую теплицу отдельно (если понадобится)
export const createGreenhouse = async (name, description) => {
    const { data } = await $authHost.post('api/greenhouse', { name, description });
    return data;
};

// Обновить теплицу
export const updateGreenhouse = async (id, name, description) => {
    const { data } = await $authHost.put(`api/greenhouse/${id}`, { name, description });
    return data;
};

// Удалить теплицу
export const deleteGreenhouse = async (id) => {
    const { data } = await $authHost.delete(`api/greenhouse/${id}`);
    return data;
};