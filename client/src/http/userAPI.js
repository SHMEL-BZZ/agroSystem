import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";

// Регистрация
export const registration = async (login, password) => {
    try {
        const { data } = await $host.post('/api/user/registration', {
            login,
            password,
        });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    } catch (e) {
        // Пробрасываем ошибку наверх с читаемым сообщением
        const message =
            e.response?.data?.message ||
            e.message ||
            'Ошибка регистрации';
        throw new Error(message);
    }
};

// Вход
export const login = async (login, password) => {
    try {
        const { data } = await $host.post('/api/user/login', {
            login,
            password,
        });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    } catch (e) {
        const message =
            e.response?.data?.message ||
            e.message ||
            'Ошибка входа';
        throw new Error(message);
    }
};

// Проверка токена (например, при перезагрузке страницы)
export const check = async () => {
    try {
        const { data } = await $authHost.get('/api/user/auth');
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    } catch (e) {
        // Если токен протух — чистим localStorage
        localStorage.removeItem('token');
        const message =
            e.response?.data?.message ||
            e.message ||
            'Не авторизован';
        throw new Error(message);
    }
};