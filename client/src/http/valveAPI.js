// client/src/http/valveAPI.js
import { $authHost, $host } from './index';

/**
 * ѕолучить список всех клапанов.
 * »спользуетс€ на странице ValvesPage дл€ отображени€ левой панели.
 *
 * @returns {Promise<Array<{id: number, manufacturer: string, model: string, constructionType: string, diameter: number, state: string}>>}
 */
export const fetchValves = async () => {
    const { data } = await $host.get('api/valve');
    return data;
};

/**
 * ѕолучить один клапан по идентификатору.
 * @param {number} id Ч идентификатор клапана.
 * @returns {Promise<Object>}
 */
export const fetchOneValve = async (id) => {
    const { data } = await $host.get(`api/valve/${id}`);
    return data;
};

/**
 * —оздать новый клапан.
 * ¬алидаци€ выполн€етс€ на клиенте (ValvesPage) и дублируетс€ на сервере.
 * @param {{manufacturer: string, model: string, constructionType: string, state: string, diameter?: number}} payload
 * @returns {Promise<Object>} Ч созданный клапан с присвоенным id.
 */
export const createValve = async (payload) => {
    const { data } = await $authHost.post('api/valve', payload);
    return data;
};

/**
 * ќбновить существующий клапан.
 * @param {number} id Ч идентификатор клапана.
 * @param {Object} payload Ч пол€ дл€ обновлени€.
 * @returns {Promise<Object>}
 */
export const updateValve = async (id, payload) => {
    const { data } = await $authHost.put(`api/valve/${id}`, payload);
    return data;
};

/**
 * ”далить клапан по идентификатору.
 * @param {number} id Ч идентификатор клапана.
 * @returns {Promise<Object>}
 */
export const deleteValve = async (id) => {
    const { data } = await $authHost.delete(`api/valve/${id}`);
    return data;
};

/**
 * ѕрив€зать теплицу к клапану.
 * payload может содержать blockId (существующа€ теплица) или name/description (нова€).
 * @param {number} valveId Ч идентификатор клапана.
 * @param {{blockId?: number, name?: string, description?: string}} payload
 * @returns {Promise<Object>}
 */
export const linkGreenhouseToValve = async (valveId, payload) => {
    const { data } = await $authHost.post(`api/valve/${valveId}/greenhouses`, payload);
    return data;
};

/**
 * ќтв€зать теплицу от клапана.
 * @param {number} valveId Ч идентификатор клапана.
 * @param {number} blockId Ч идентификатор теплицы.
 * @returns {Promise<Object>}
 */
export const unlinkGreenhouseFromValve = async (valveId, blockId) => {
    const { data } = await $authHost.delete(`api/valve/${valveId}/greenhouses/${blockId}`);
    return data;
};