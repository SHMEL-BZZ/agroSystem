import { $authHost, $host } from './index';

/**
 * Получить список всех добавок со склада (из БД).
 * Используется в SolutionsPage и SolutionsInfo.
 * @returns {Promise<Array<Object>>}
 */
export const fetchAdditives = async () => {
    const { data } = await $host.get('api/additive');
    return data;
};

/**
 * Создать новую добавку.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const createAdditive = async (payload) => {
    const { data } = await $authHost.post('api/additive', payload);
    return data;
};

/**
 * Обновить добавку.
 * @param {number} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const updateAdditive = async (id, payload) => {
    const { data } = await $authHost.put(`api/additive/${id}`, payload);
    return data;
};

/**
 * Удалить добавку.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const deleteAdditive = async (id) => {
    const { data } = await $authHost.delete(`api/additive/${id}`);
    return data;
};