// // src/http/userAPI.js
// // Мок-версия API: работает без сервера, всё хранится в localStorage.

// const USERS_KEY = 'mock_users'; // список зарегистрированных пользователей
// const DELAY = 300;              // имитация задержки сети, мс

// // Искусственная задержка, чтобы UX был похож на реальный запрос
// const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// // Безопасное чтение списка пользователей
// const readUsers = () => {
//     try {
//         return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
//     } catch {
//         return [];
//     }
// };

// // Сохранение списка пользователей
// const writeUsers = (users) => {
//     localStorage.setItem(USERS_KEY, JSON.stringify(users));
// };

// // Создание "токена" (просто base64-строка, без подписи)
// const makeToken = (login) =>
//     btoa(JSON.stringify({ login, iat: Date.now() }));

// // Декодирование "токена"
// const decodeToken = (token) => {
//     try {
//         return JSON.parse(atob(token));
//     } catch {
//         return null;
//     }
// };

// // Регистрация
// export const registration = async (login, password) => {
//     await wait(DELAY);

//     const users = readUsers();
//     if (users.some((u) => u.login === login)) {
//         const err = new Error('Пользователь с таким логином уже существует');
//         err.response = { data: { message: err.message } };
//         throw err;
//     }

//     users.push({ login, password });
//     writeUsers(users);

//     const token = makeToken(login);
//     localStorage.setItem('token', token);
//     return decodeToken(token);
// };

// // Вход
// export const login = async (login, password) => {
//     await wait(DELAY);

//     const users = readUsers();
//     const found = users.find(
//         (u) => u.login === login && u.password === password
//     );

//     if (!found) {
//         const err = new Error('Неверный логин или пароль');
//         err.response = { data: { message: err.message } };
//         throw err;
//     }

//     const token = makeToken(login);
//     localStorage.setItem('token', token);
//     return decodeToken(token);
// };

// // Проверка токена (например, при перезагрузке страницы)
// export const check = async () => {
//     await wait(DELAY);

//     const token = localStorage.getItem('token');
//     if (!token) {
//         const err = new Error('Не авторизован');
//         err.response = { data: { message: err.message } };
//         throw err;
//     }

//     const decoded = decodeToken(token);
//     if (!decoded) {
//         const err = new Error('Некорректный токен');
//         err.response = { data: { message: err.message } };
//         throw err;
//     }

//     return decoded;
// };

import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode";

// регистрация
export const registration = async (login, email, password) => {
    const { data } = await $host.post('api/user/registration', {
        login,
        email,
        password
    });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
};

// вход
export const login = async (login, password) => {
    const { data } = await $host.post('api/user/login', { login, password });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
};

// проверка/продление токена
export const check = async () => {
    const { data } = await $authHost.get('api/user/auth');
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
};

// получить данные текущего пользователя (id, login, email) без пароля
export const getMe = async () => {
    const { data } = await $authHost.get('api/user/me');
    return data; // { id, login, email }
};