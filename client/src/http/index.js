import axios from "axios";
import { API_BASE_URL } from "../config/api"; // Импортируем наш базовый URL

// 1. Публичный хост (для логина и регистрации)
const $host = axios.create({
    baseURL: API_BASE_URL // Теперь это http://localhost:3000/api
})

// 2. Защищенный хост (для всего остального: клапаны, теплицы и т.д.)
const $authHost = axios.create({
    baseURL: API_BASE_URL
})

// 3. Перехватчик, который автоматически добавляет токен
const authInterceptor = config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
}

$authHost.interceptors.request.use(authInterceptor)

export { $host, $authHost }