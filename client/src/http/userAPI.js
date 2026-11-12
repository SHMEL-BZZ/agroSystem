
import { authApi } from './authApi';
import { setToken, removeToken, decodeToken } from '../utils/authToken';

export const registration = async (login, password, email) => {
    try {
        return await authApi.register({ login, email, password });
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || 'Ошибка регистрации');
    }
};

export const login = async (login, password) => {
    try {
        const { token } = await authApi.login(login, password);
        setToken(token);
        return decodeToken(token);
    } catch (e) {
        throw new Error(e.response?.data?.message || e.message || 'Ошибка входа');
    }
};

export const check = async () => {
    try {
        return authApi.check();
    } catch (e) {
        removeToken();
        throw new Error('Не авторизован');
    }
};
