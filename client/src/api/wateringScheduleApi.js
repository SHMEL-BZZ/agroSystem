// client/src/api/wateringScheduleApi.js
import { http } from './http';

export const wateringScheduleApi = {
    // Получить расписание на дату
    // date — 'YYYY-MM-DD'
    getByDate: (date) => http.get(`/watering-schedule?date=${date}`),

    // Сохранить расписание
    // data — { date, periods: [{ name, start, duration, volume, tanks, valves }] }
    save: (data) => http.post('/watering-schedule', data),

    // Удалить расписание на дату
    remove: (date) => http.delete(`/watering-schedule?date=${date}`),
};