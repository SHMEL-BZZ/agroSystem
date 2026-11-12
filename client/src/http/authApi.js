// client/src/http/authApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';
import { getToken, decodeToken } from '../utils/authToken';

// Login/register возвращают { token, user }: token — access-токен Auth-сервиса.
// Сохранением токена занимается вызывающий код. Refresh-токен хранится в httpOnly-cookie.
const toClientShape = (data) => ({ token: data.accessToken, user: data.user });

export const authApi = {
    // Вход (по логину или email)
    login: async (login, password) =>
        toClientShape(
            await http.post(ENDPOINTS.auth.login, { login, password }, { auth: true })
        ),

    // Регистрация. email необязателен
    register: async ({ login, email, password }) =>
        toClientShape(
            await http.post(
                ENDPOINTS.auth.register,
                { login, email: email || undefined, password },
                { auth: true }
            )
        ),

    // Выход: удаляет refresh-токен на сервере и cookie. Ошибка сети не должна мешать выходу
    logout: () =>
        http.post(ENDPOINTS.auth.logout, undefined, { auth: true }).catch(() => null),

    // Проверка токена на клиенте (например, при перезагрузке страницы)
    check: () => {
        const token = getToken();
        if (!token) throw new Error('Нет токена');
        const decoded = decodeToken(token);
        if (decoded.exp < Date.now() / 1000) throw new Error('Токен истёк');
        return decoded;
    },
};
