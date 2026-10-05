import { getChartData } from '../api/chartsApi';

export const chartConfigs = {
    drainage: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        yRightLabel: 'Дренаж, %',
        periodType: 'day',
        series: [
            { key: 'watering', name: 'Полив, л', color: '#4A90E2', unit: 'л' },
            { key: 'drainage', name: 'Дренаж, л', color: '#AE6E42', unit: 'л' },
            { key: 'drainagePercent', name: 'Дренаж, %', color: '#2E7D32', unit: '%', yAxisId: 'right' },
        ],
    },

    'ec-ph': {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'EC, мСм/см',
        yRightLabel: 'pH',
        periodType: 'day',
        series: [
            { key: 'drainageEC', name: 'EC дренажа', color: '#4A90E2', unit: 'мСм/см' },
            { key: 'drainagePH', name: 'pH дренажа', color: '#9C27B0', unit: 'pH', yAxisId: 'right' },
        ],
    },

    watering: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        periodType: 'day',
        series: [{ key: 'volume', name: 'Объём, л', color: '#4A90E2', unit: 'л' }],
    },

    starts: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время старта',
        yLeftLabel: 'Длительность, мин',
        yRightLabel: 'Пауза, мин',
        periodType: 'day',
        series: [
            { key: 'duration', name: 'Длительность, мин', color: '#4A90E2', unit: 'мин' },
            { key: 'intervalMin', name: 'Пауза, мин', color: '#AE6E42', unit: 'мин', yAxisId: 'right' },
        ],
    },

    'feed-ec': {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'EC, мСм/см',
        periodType: 'range',
        series: [
            { key: 'feedEC', name: 'EC фактический', color: '#4A90E2', unit: 'мСм/см' },
            { key: 'targetEC', name: 'EC целевой', color: '#F44336', unit: 'мСм/см', dashed: true },
        ],
    },

    'feed-ph': {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'pH',
        periodType: 'range',
        series: [
            { key: 'feedPH', name: 'pH фактический', color: '#9C27B0', unit: 'pH' },
            { key: 'targetPH', name: 'pH целевой', color: '#F44336', unit: 'pH', dashed: true },
        ],
    },

    'water-temp': {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Температура, °C',
        periodType: 'range',
        series: [{ key: 'temp', name: 'Температура', color: '#FF9800', unit: '°C' }],
    },

    'substrate-moisture': {
        type: 'area',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Влажность, %',
        periodType: 'range',
        series: [{ key: 'wc', name: 'Влажность', color: '#2E7D32', unit: '%' }],
    },

    consumption: {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        periodType: 'range',
        series: [
            { key: 'water', name: 'Вода, л', color: '#4A90E2', unit: 'л' },
            { key: 'solution', name: 'Раствор, л', color: '#AE6E42', unit: 'л' },
        ],
    },
};

export async function fetchChartData(chartId, filters) {
    const config = chartConfigs[chartId];
    if (!config) return null;

    const { dateFrom, dateTo } = filters || {};
    if (!dateFrom || !dateTo) {
        return { ...config, data: [] };
    }

    // ─── Запрос к серверу ───
    let rawData = [];
    try {
        rawData = await getChartData(chartId, { dateFrom, dateTo });
        if (!Array.isArray(rawData)) rawData = [];
    } catch (e) {
        console.error('Ошибка загрузки данных графика:', e);
        return { ...config, data: [] };
    }

    const isSingleDay = dateFrom === dateTo;

    // ─── Один день: точки по времени ───
    if (isSingleDay) {
        return {
            ...config,
            xKey: 'time',
            xLabel: 'Время',
            data: rawData.filter((p) => p.date === dateFrom),
        };
    }

    // ─── Диапазон: усредняем по датам ───
    const byDate = new Map();
    rawData.forEach((p) => {
        if (!byDate.has(p.date)) byDate.set(p.date, []);
        byDate.get(p.date).push(p);
    });

    const metricKeys = config.series.map((s) => s.key);

    const averaged = Array.from(byDate.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, points]) => {
            const avg = { date, time: date };
            metricKeys.forEach((key) => {
                const values = points
                    .map((p) => p[key])
                    .filter((v) => typeof v === 'number' && !isNaN(v));
                avg[key] = values.length
                    ? Math.round(
                        (values.reduce((s, v) => s + v, 0) / values.length) * 100
                    ) / 100
                    : null;
            });
            return avg;
        });

    return {
        ...config,
        xKey: 'date',
        xLabel: 'Дата',
        data: averaged,
    };
}