// client/src/http/http.js
import { API_BASE_URL } from '../config/api';
import { getToken, removeToken } from '../utils/authToken';

// API_BASE_URL может быть как с /api на конце, так и без него
const BASE_URL = API_BASE_URL.replace(/\/+$/, '').replace(/\/api$/, '') + '/api';

// { a: 1, b: undefined } -> '?a=1'
const buildQuery = (params) => {
    if (!params) return '';

    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.append(key, value);
        }
    });

    const query = search.toString();
    return query ? `?${query}` : '';
};

/**
 * Универсальный запрос к API.
 *
 * @param {string} endpoint — путь без /api, например '/valve'
 * @param {object} options — { method, body, params, headers, isFormData }
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
    const {
        method = 'GET',
        body,
        params,
        headers = {},
        isFormData = false,
    } = options;

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${path}${buildQuery(params)}`;

    const finalHeaders = { ...headers };

    if (!isFormData) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const finalBody = isFormData || !body ? body : JSON.stringify(body);

    const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    if (response.status === 204) return null;

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    if (!response.ok) {
        if (response.status === 401) {
            removeToken();
        }

        const message =
            data?.message ||
            data?.error ||
            `Ошибка ${response.status}: ${response.statusText}`;

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        // Формат как у axios — на него завязаны alert(e.response?.data?.message)
        error.response = { status: response.status, data };
        throw error;
    }

    return data;
}

export const http = {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options) =>
        request(url, { ...options, method: 'POST', body }),
    put: (url, body, options) =>
        request(url, { ...options, method: 'PUT', body }),
    patch: (url, body, options) =>
        request(url, { ...options, method: 'PATCH', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};
