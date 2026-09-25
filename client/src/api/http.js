// client/src/api/http.js
import { API_BASE_URL } from '../config/api';
import { getToken, removeToken } from '../utils/authToken';

/**
 * Универсальный запрос к API.
 *
 * @param {string} endpoint — например, '/valve'
 * @param {object} options — { method, body, headers, ... }
 * @returns {Promise<any>} — распарсенный JSON или пустой ответ
 */
export async function request(endpoint, options = {}) {
    const {
        method = 'GET',
        body,
        headers = {},
        isFormData = false,
    } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const finalHeaders = {
        ...headers,
    };

    // Если это не FormData — добавляем Content-Type: application/json
    if (!isFormData) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    // Токен авторизации
    const token = getToken();
    if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    const finalBody = isFormData
        ? body
        : body
            ? JSON.stringify(body)
            : undefined;

    const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
    });

    // Пустой ответ (204)
    if (response.status === 204) return null;

    // Пытаемся распарсить JSON
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    // Ошибка
    if (!response.ok) {
        // 401 — токен протух, чистим и отправляем на логин
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
        throw error;
    }

    return data;
}

// ─── Удобные обёртки ───
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