const mockDrainage = [
    { time: '06:00', watering: 120, drainage: 30, drainagePercent: 25 },
    { time: '08:00', watering: 140, drainage: 35, drainagePercent: 25 },
    { time: '10:00', watering: 150, drainage: 45, drainagePercent: 30 },
    { time: '12:00', watering: 160, drainage: 48, drainagePercent: 30 },
    { time: '14:00', watering: 150, drainage: 42, drainagePercent: 28 },
    { time: '16:00', watering: 130, drainage: 33, drainagePercent: 25 },
    { time: '18:00', watering: 110, drainage: 22, drainagePercent: 20 },
];

const mockEcPh = [
    { time: '06:00', feedEC: 2.1, substrateEC: 2.4, drainageEC: 2.6, feedPH: 5.8, substratePH: 6.0, drainagePH: 6.2 },
    { time: '08:00', feedEC: 2.2, substrateEC: 2.5, drainageEC: 2.7, feedPH: 5.8, substratePH: 6.0, drainagePH: 6.3 },
    { time: '10:00', feedEC: 2.2, substrateEC: 2.6, drainageEC: 2.8, feedPH: 5.9, substratePH: 6.1, drainagePH: 6.3 },
    { time: '12:00', feedEC: 2.3, substrateEC: 2.6, drainageEC: 2.9, feedPH: 5.8, substratePH: 6.1, drainagePH: 6.4 },
    { time: '14:00', feedEC: 2.2, substrateEC: 2.5, drainageEC: 2.8, feedPH: 5.8, substratePH: 6.0, drainagePH: 6.3 },
    { time: '16:00', feedEC: 2.2, substrateEC: 2.4, drainageEC: 2.7, feedPH: 5.8, substratePH: 6.0, drainagePH: 6.2 },
    { time: '18:00', feedEC: 2.1, substrateEC: 2.3, drainageEC: 2.5, feedPH: 5.7, substratePH: 5.9, drainagePH: 6.1 },
];

const mockWatering = [
    { time: '06:00', volume: 120, valve: 'A' },
    { time: '08:00', volume: 140, valve: 'A' },
    { time: '10:00', volume: 150, valve: 'B' },
    { time: '12:00', volume: 160, valve: 'B' },
    { time: '14:00', volume: 150, valve: 'A' },
    { time: '16:00', volume: 130, valve: 'A' },
    { time: '18:00', volume: 110, valve: 'B' },
];

const mockStarts = [
    { time: '06:00', duration: 4, intervalMin: 0 },
    { time: '06:30', duration: 3, intervalMin: 30 },
    { time: '07:00', duration: 3, intervalMin: 30 },
    { time: '07:40', duration: 4, intervalMin: 40 },
    { time: '08:20', duration: 3, intervalMin: 40 },
    { time: '09:00', duration: 3, intervalMin: 40 },
];

const mockFeedEc = [
    { time: '06:00', feedEC: 2.1, targetEC: 2.2 },
    { time: '08:00', feedEC: 2.2, targetEC: 2.2 },
    { time: '10:00', feedEC: 2.2, targetEC: 2.2 },
    { time: '12:00', feedEC: 2.3, targetEC: 2.2 },
    { time: '14:00', feedEC: 2.2, targetEC: 2.2 },
    { time: '16:00', feedEC: 2.2, targetEC: 2.2 },
    { time: '18:00', feedEC: 2.1, targetEC: 2.2 },
];

const mockFeedPh = [
    { time: '06:00', feedPH: 5.8, targetPH: 5.8 },
    { time: '08:00', feedPH: 5.8, targetPH: 5.8 },
    { time: '10:00', feedPH: 5.9, targetPH: 5.8 },
    { time: '12:00', feedPH: 5.8, targetPH: 5.8 },
    { time: '14:00', feedPH: 5.8, targetPH: 5.8 },
    { time: '16:00', feedPH: 5.8, targetPH: 5.8 },
    { time: '18:00', feedPH: 5.7, targetPH: 5.8 },
];

const mockWaterTemp = [
    { time: '06:00', temp: 18 },
    { time: '08:00', temp: 19 },
    { time: '10:00', temp: 20 },
    { time: '12:00', temp: 21 },
    { time: '14:00', temp: 22 },
    { time: '16:00', temp: 21 },
    { time: '18:00', temp: 20 },
];

const mockSubstrateMoisture = [
    { time: '06:00', wc: 55 },
    { time: '08:00', wc: 70 },
    { time: '10:00', wc: 75 },
    { time: '12:00', wc: 72 },
    { time: '14:00', wc: 68 },
    { time: '16:00', wc: 60 },
    { time: '18:00', wc: 50 },
    { time: '20:00', wc: 45 },
];

const mockConsumption = [
    { time: '06:00', water: 0, fertA: 0, fertB: 0, fertC: 0 },
    { time: '08:00', water: 5, fertA: 1.2, fertB: 1.1, fertC: 0.8 },
    { time: '10:00', water: 11, fertA: 2.5, fertB: 2.3, fertC: 1.6 },
    { time: '12:00', water: 18, fertA: 4.0, fertB: 3.8, fertC: 2.6 },
    { time: '14:00', water: 25, fertA: 5.6, fertB: 5.3, fertC: 3.6 },
    { time: '16:00', water: 31, fertA: 7.0, fertB: 6.6, fertC: 4.5 },
    { time: '18:00', water: 36, fertA: 8.2, fertB: 7.7, fertC: 5.3 },
];


export const chartConfigs = {
    drainage: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Объём, л',
        yRightLabel: 'Дренаж, %',
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
        data: mockWatering,
        series: [{ key: 'volume', name: 'Объём, л', color: '#4A90E2', unit: 'л' }],
    },

    starts: {
        type: 'bar',
        xKey: 'time',
        xLabel: 'Время старта',
        yLeftLabel: 'Длительность, мин',
        yRightLabel: 'Пауза, мин',
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
        data: mockWaterTemp,
        series: [{ key: 'temp', name: 'Температура', color: '#FF9800', unit: '°C' }],
    },

    'substrate-moisture': {
        type: 'area',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Влажность, %',
        data: mockSubstrateMoisture,
        series: [{ key: 'wc', name: 'Влажность', color: '#2E7D32', unit: '%' }],
    },

    consumption: {
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'Вода, м³',
        yRightLabel: 'Удобрения, л',
        data: mockConsumption,
        series: [
            { key: 'water', name: 'Вода, м³', color: '#4A90E2', unit: 'м³' },
            { key: 'fertA', name: 'Канал A, л', color: '#AE6E42', unit: 'л', yAxisId: 'right' },
            { key: 'fertB', name: 'Канал B, л', color: '#2E7D32', unit: 'л', yAxisId: 'right' },
            { key: 'fertC', name: 'Канал C, л', color: '#9C27B0', unit: 'л', yAxisId: 'right' },
        ],
    },
};
// "Алгоритм" получения данных по id

export async function fetchChartData(chartId) {
    return chartConfigs[chartId] || null;
}