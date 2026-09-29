import { http } from './http';

export const generatorsApi = {
    list: () => http.get('/generators'),
    run: (name) => http.post(`/generators/${name}/run`),
    status: (name) => http.get(`/generators/${name}/status`),
    data: (name, date) => http.get(`/generators/${name}/data?date=${date}`),  
};