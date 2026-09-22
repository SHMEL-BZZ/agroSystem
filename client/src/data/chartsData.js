const DAYS = [
    '2026-09-15',
    '2026-09-16',
    '2026-09-17',
    '2026-09-18',
    '2026-09-19',
    '2026-09-20',
    '2026-09-21',
];

const TIMES = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const rnd = (base, spread) => Math.round((base + (Math.random() - 0.5) * spread) * 10) / 10;

const mockDrainage = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        watering: rnd(140, 40),
        drainage: rnd(38, 15),
        drainagePercent: rnd(27, 6),
    }))
);

const mockEcPh = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        feedEC: rnd(2.2, 0.2),
        substrateEC: rnd(2.5, 0.3),
        drainageEC: rnd(2.7, 0.3),
        feedPH: rnd(5.8, 0.2),
        substratePH: rnd(6.0, 0.2),
        drainagePH: rnd(6.3, 0.2),
    }))
);

const mockWatering = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        volume: rnd(140, 40),
        valve: Math.random() > 0.5 ? 'A' : 'B',
    }))
);

const mockStarts = DAYS.flatMap((date) =>
    ['06:00', '06:30', '07:00', '07:40', '08:20', '09:00', '12:00', '15:00'].map((time) => ({
        date,
        time,
        duration: Math.round(rnd(3.5, 1.5)),
        intervalMin: Math.round(rnd(30, 15)),
    }))
);

const mockFeedEc = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        feedEC: rnd(2.2, 0.2),
        targetEC: 2.2,
    }))
);

const mockFeedPh = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        feedPH: rnd(5.8, 0.2),
        targetPH: 5.8,
    }))
);

const mockWaterTemp = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        temp: rnd(20, 3),
    }))
);

const mockSubstrateMoisture = DAYS.flatMap((date) =>
    TIMES.map((time) => ({
        date,
        time,
        wc: rnd(65, 15),
    }))
);

const mockConsumption = DAYS.flatMap((date, dayIdx) =>
    TIMES.map((time, i) => ({
        date,
        time,
        water: dayIdx * 36 + i * 5,
        fertA: dayIdx * 8 + i * 1.2,
        fertB: dayIdx * 7.5 + i * 1.1,
        fertC: dayIdx * 5 + i * 0.8,
    }))
);

export const chartConfigs = {
    drainage: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        yRightLabel: 'Дренаж, %',
        periodType: 'day',
        data: mockDrainage,
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
        data: mockEcPh,
        series: [
            { key: 'feedEC', name: 'EC подача', color: '#4A90E2', unit: 'мСм/см' },
            { key: 'substrateEC', name: 'EC субстрат', color: '#2E7D32', unit: 'мСм/см' },
            { key: 'drainageEC', name: 'EC дренаж', color: '#AE6E42', unit: 'мСм/см' },
            { key: 'feedPH', name: 'pH подача', color: '#9C27B0', unit: 'pH', yAxisId: 'right' },
            { key: 'substratePH', name: 'pH субстрат', color: '#FF9800', unit: 'pH', yAxisId: 'right' },
            { key: 'drainagePH', name: 'pH дренаж', color: '#F44336', unit: 'pH', yAxisId: 'right' },
        ],
    },

    watering: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        periodType: 'day',
        data: mockWatering,
        series: [{ key: 'volume', name: 'Объём, л', color: '#4A90E2', unit: 'л' }],
    },

    starts: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время старта',
        yLeftLabel: 'Длительность, мин',
        yRightLabel: 'Пауза, мин',
        periodType: 'day',
        data: mockStarts,
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
        data: mockFeedEc,
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
        data: mockFeedPh,
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
        data: mockWaterTemp,
        series: [{ key: 'temp', name: 'Температура', color: '#FF9800', unit: '°C' }],
    },

    'substrate-moisture': {
        type: 'area',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Влажность, %',
        periodType: 'range',
        data: mockSubstrateMoisture,
        series: [{ key: 'wc', name: 'Влажность', color: '#2E7D32', unit: '%' }],
    },

    consumption: {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Вода, м³',
        yRightLabel: 'Удобрения, л',
        periodType: 'range',
        data: mockConsumption,
        series: [
            { key: 'water', name: 'Вода, м³', color: '#4A90E2', unit: 'м³' },
            { key: 'fertA', name: 'Канал A, л', color: '#AE6E42', unit: 'л', yAxisId: 'right' },
            { key: 'fertB', name: 'Канал B, л', color: '#2E7D32', unit: 'л', yAxisId: 'right' },
            { key: 'fertC', name: 'Канал C, л', color: '#9C27B0', unit: 'л', yAxisId: 'right' },
        ],
    },
};

export async function fetchChartData(chartId, filters) {
    const config = chartConfigs[chartId];
    if (!config) return null;

    const { dateFrom, dateTo } = filters || {};
    if (!dateFrom || !dateTo) {
        return { ...config };
    }

    const isSingleDay = dateFrom === dateTo;

    if (isSingleDay) {
        const dayData = config.data.filter((p) => p.date === dateFrom);

        return {
            ...config,
            xKey: 'time',
            xLabel: 'Время',
            data: dayData,
        };
    }

    const inRange = config.data.filter(
        (p) => p.date >= dateFrom && p.date <= dateTo
    );

    const byDate = new Map();
    inRange.forEach((p) => {
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
                    ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100
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