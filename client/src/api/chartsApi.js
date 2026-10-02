import { $authHost } from '../http';

export const getChartData = async (chartId, { dateFrom, dateTo }) => {
    const { data } = await $authHost.get(`/api/charts/${chartId}`, {
        params: { dateFrom, dateTo },
    });
    return data.data;
};

export const getAvailableRange = async () => {
    const { data } = await $authHost.get('/api/charts/available-range');
    return data;
};