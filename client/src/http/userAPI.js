import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";
import { ENDPOINTS } from "../config/api";

// Регистрация
export const registration = async (login, password, email) => {
    try {
        const { data } = await $host.post(ENDPOINTS.auth.register, {
            login,
            password,
            email
        });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    } catch (e) {
        const message = e.response?.data?.message || e.message || 'Ошибка регистрации';
        throw new Error(message);
    }
};

// Вход
export const login = async (login, password) => {
    try {
        const { data } = await $host.post(ENDPOINTS.auth.login, {
            login,
            password,
        });
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    } catch (e) {
        const message = e.response?.data?.message || e.message || 'Ошибка входа';
        throw new Error(message);
    }
};

// Проверка токена (при перезагрузке страницы)
export const check = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Нет токена');

        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            throw new Error('Токен истек');
        }

        return decoded;
    } catch (e) {
        localStorage.removeItem('token');
        throw new Error('Не авторизован');
    }
};