// Обёртки над authApi (прежний API: возвращают расшифрованного пользователя)
import { authApi } from './authApi';
import { setToken, removeToken, decodeToken } from '../utils/authToken';

// Регистрация
export const registration = async (login, password, email) => {
    try {
        const { token } = await authApi.register({ login, email, password });
        setToken(token);
        return decodeToken(token);
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || 'Ошибка регистрации');
    }
};

// Вход
export const login = async (login, password) => {
    try {
        const { token } = await authApi.login(login, password);
        setToken(token);
        return decodeToken(token);
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || 'Ошибка входа');
    }
};

// Проверка токена (при перезагрузке страницы)
export const check = async () => {
    try {
        return authApi.check();
    } catch (e) {
        removeToken();
        throw new Error('Не авторизован');
    }
};
