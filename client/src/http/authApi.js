
import { http } from './http';
import { ENDPOINTS } from '../config/api';
import { getToken, decodeToken } from '../utils/authToken';

const toClientShape = (data) => ({ token: data.accessToken, user: data.user });

export const authApi = {
    login: async (login, password) =>
        toClientShape(
            await http.post(ENDPOINTS.auth.login, { login, password }, { auth: true })
        ),


    register: ({ login, email, password }) =>
        http.post(ENDPOINTS.auth.register, { login, email, password }, { auth: true }),

    refresh: async () =>
        toClientShape(await http.post(ENDPOINTS.auth.refresh, undefined, { auth: true })),

    logout: () =>
        http.post(ENDPOINTS.auth.logout, undefined, { auth: true }).catch(() => null),

    check: () => {
        const token = getToken();
        if (!token) throw new Error('Нет токена');
        const decoded = decodeToken(token);
        if (decoded.exp < Date.now() / 1000) throw new Error('Токен истёк');
        return decoded;
    },
};