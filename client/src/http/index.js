
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
// Единая точка входа: fetch-клиент и API-модули по сущностям
export { http, request } from './http';
export { authApi } from './authApi';
export { valvesApi } from './valvesApi';
export { greenhousesApi } from './greenhousesApi';
export { tanksApi } from './tanksApi';
export { additivesApi } from './additivesApi';
export {
    solutionsApi,
    solutionHistoryApi,
    solutionCompositionApi,
} from './solutionsApi';
export { wateringApi, wateringScheduleApi } from './wateringApi';
export { conditionsApi } from './conditionsApi';
export { drainApi } from './drainApi';
export { chartsApi } from './chartsApi';
export { generatorsApi } from './generatorsApi';
>>>>>>> origin/client
