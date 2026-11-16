
import { API_BASE_URL, AUTH_BASE_URL, ENDPOINTS } from '../config/api';
import { getToken, setToken, removeToken } from '../utils/authToken';

let refreshPromise = null;

function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = fetch(`${AUTH_BASE_URL}${ENDPOINTS.auth.refresh}`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(async (res) => {
                if (!res.ok) return null;
                const data = await res.json();
                if (!data?.accessToken) return null;
                setToken(data.accessToken);
                return data.accessToken;
            })
            .catch(() => null)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

function endSession() {
    removeToken();
    localStorage.removeItem('username');
    const path = window.location.pathname;
    if (path !== '/login' && path !== '/register') {
        window.location.assign('/login');
    }
}

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

export async function request(endpoint, options = {}) {
    const {
        method = 'GET',
        body,
        params,
        headers = {},
        isFormData = false,
        auth = false,
        _retried = false,
    } = options;

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${auth ? AUTH_BASE_URL : API_BASE_URL}${path}${buildQuery(params)}`;

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
        credentials: auth ? 'include' : 'same-origin',
    });

    if (response.status === 401 && !auth && !_retried) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            return request(endpoint, { ...options, _retried: true });
        }
    }

    if (response.status === 204) return null;

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    if (!response.ok) {
        if (response.status === 401 && !auth) {
            endSession();
        }

        const message =
            data?.message ||
            data?.error ||
            `Ошибка ${response.status}: ${response.statusText}`;

        const error = new Error(message);
        error.status = response.status;
        error.data = data;
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
