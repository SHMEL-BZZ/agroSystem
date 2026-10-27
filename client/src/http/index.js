// client/src/http/index.js
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
