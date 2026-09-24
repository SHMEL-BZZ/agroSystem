// client/src/api/authApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

export const authApi = {
    login: (login, password) =>
        http.post(ENDPOINTS.auth.login, { login, password }),

    register: (login, password) =>
        http.post(ENDPOINTS.auth.register, { login, password }),

    check: () => http.get(ENDPOINTS.auth.check),
};