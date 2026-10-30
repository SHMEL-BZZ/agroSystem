// client/src/utils/authToken.js
import { jwtDecode } from 'jwt-decode';

// Работа с JWT-токеном. getToken() используется в client/src/http/http.js
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// Расшифровать токен в объект пользователя ({ id, login, ... })
export const decodeToken = (token) => jwtDecode(token);
