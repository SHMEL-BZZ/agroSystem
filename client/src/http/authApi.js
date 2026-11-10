// client/src/http/authApi.js
import { http } from './http';
import { ENDPOINTS } from '../config/api';

// Все методы возвращают { token } — сохранением токена занимается вызывающий код
export const authApi = {
    // Вход
    login: (login, password) =>
        http.post(ENDPOINTS.auth.login, { login, password }),

    // Регистрация. email необязателен
    register: ({ login, email, password }) =>
        http.post(ENDPOINTS.auth.register, { login, email, password }),

    // Проверка токена (например, при перезагрузке страницы)
    check: () => http.get(ENDPOINTS.auth.check),
};
