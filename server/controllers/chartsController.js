const { Op, fn, col } = require('sequelize');
const {
    DailyCondition,
    WateringHistory,
    DrainHistory,
    SolutionHistory,
    SolutionComposition,
    Additive,
} = require('../models/models');

const toDateOnly = (date) => new Date(date).toISOString().slice(0, 10);
const toTimeOnly = (date) =>
    new Date(date).toTimeString().slice(0, 5);

async function getDrainage({ dateFrom, dateTo }) {
    const waterings = await WateringHistory.findAll({
        where: {
            startTime: {
                [Op.between]: [
                    `${dateFrom} 00:00:00`,
                    `${dateTo} 23:59:59`,
                ],
            },
        },
        include: [
            {
                model: DrainHistory,
                as: 'drains',
                required: false,
            },
        ],
        order: [['startTime', 'ASC']],
    });

    return waterings.map((w) => {
        const drainSum = (w.drains || []).reduce(
            (s, d) => s + parseFloat(d.drainVolume || 0),
            0
        );
        const watering = parseFloat(w.waterVolume || 0);
        return {
            date: toDateOnly(w.startTime),
            time: toTimeOnly(w.startTime),
            watering,
            drainage: drainSum,
            drainagePercent: watering > 0 ? (drainSum / watering) * 100 : 0,
        };
    });
}

async function getEcPh({ dateFrom, dateTo }) {
    const conditions = await DailyCondition.findAll({
        where: {
            date: { [Op.between]: [dateFrom, dateTo] },
        },
        order: [['date', 'ASC']],
    });

    return conditions.map((c) => ({
        date: toDateOnly(c.date),
        time: '12:00',
        drainageEC: parseFloat(c.avgConductivity || 0),
        drainagePH: parseFloat(c.avgPh || 0),
    }));
}

async function getWatering({ dateFrom, dateTo }) {
    const waterings = await WateringHistory.findAll({
        where: {
            startTime: {
                [Op.between]: [
                    `${dateFrom} 00:00:00`,
                    `${dateTo} 23:59:59`,
                ],
            },
        },
        order: [['startTime', 'ASC']],
    });

    return waterings.map((w) => ({
        date: toDateOnly(w.startTime),
        time: toTimeOnly(w.startTime),
        volume: parseFloat(w.waterVolume || 0),
    }));
}

async function getStarts({ dateFrom, dateTo }) {
    const waterings = await WateringHistory.findAll({
        where: {
            startTime: {
                [Op.between]: [
                    `${dateFrom} 00:00:00`,
                    `${dateTo} 23:59:59`,
                ],
            },
        },
        order: [['startTime', 'ASC']],
    });

    const byDate = {};
    waterings.forEach((w) => {
        const date = toDateOnly(w.startTime);
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push(w);
    });

    const result = [];
    Object.entries(byDate).forEach(([date, list]) => {
        list.forEach((w, i) => {
            const prev = list[i - 1];
            const intervalMin = prev
                ? Math.round(
                    (new Date(w.startTime) - new Date(prev.startTime)) / 60000
                )
                : 0;
            result.push({
                date,
                time: toTimeOnly(w.startTime),
                duration: w.duration || 0,
                intervalMin,
            });
        });
    });

    return result;
}

async function getFeedEc({ dateFrom, dateTo }) {
    const conditions = await DailyCondition.findAll({
        where: { date: { [Op.between]: [dateFrom, dateTo] } },
        order: [['date', 'ASC']],
    });
    return conditions.map((c) => ({
        date: toDateOnly(c.date),
        time: '12:00',
        feedEC: parseFloat(c.avgConductivity || 0),
        targetEC: 2.2,
    }));
}

async function getFeedPh({ dateFrom, dateTo }) {
    const conditions = await DailyCondition.findAll({
        where: { date: { [Op.between]: [dateFrom, dateTo] } },
        order: [['date', 'ASC']],
    });
    return conditions.map((c) => ({
        date: toDateOnly(c.date),
        time: '12:00',
        feedPH: parseFloat(c.avgPh || 0),
        targetPH: 5.8,
    }));
}

async function getWaterTemp({ dateFrom, dateTo }) {
    const conditions = await DailyCondition.findAll({
        where: { date: { [Op.between]: [dateFrom, dateTo] } },
        order: [['date', 'ASC']],
    });
    return conditions.map((c) => ({
        date: toDateOnly(c.date),
        time: '12:00',
        temp: parseFloat(c.dayTemperature || 0),
    }));
}

async function getSubstrateMoisture({ dateFrom, dateTo }) {
    const conditions = await DailyCondition.findAll({
        where: { date: { [Op.between]: [dateFrom, dateTo] } },
        order: [['date', 'ASC']],
    });
    return conditions.map((c) => ({
        date: toDateOnly(c.date),
        time: '12:00',
        wc: parseFloat(c.avgHumidity || 0),
    }));
}

async function getConsumption({ dateFrom, dateTo }) {
    const waterings = await WateringHistory.findAll({
        where: {
            startTime: {
                [Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`],
            },
        },
        order: [['startTime', 'ASC']],
    });

    const waterByDate = {};
    waterings.forEach((w) => {
        const d = toDateOnly(w.startTime);
        waterByDate[d] = (waterByDate[d] || 0) + parseFloat(w.waterVolume || 0);
    });

    const solutions = await SolutionHistory.findAll({
        where: {
            date: {
                [Op.between]: [`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`],
            },
        },
        order: [['date', 'ASC']],
    });

    const solutionByDate = {};
    solutions.forEach((s) => {
        const d = toDateOnly(s.date);
        solutionByDate[d] =
            (solutionByDate[d] || 0) + parseFloat(s.totalVolume || 0);
    });

    const allDates = Array.from(
        new Set([...Object.keys(waterByDate), ...Object.keys(solutionByDate)])
    ).sort();

    return allDates.map((date) => ({
        date,
        time: '12:00',
        water: waterByDate[date] || 0,
        solution: solutionByDate[date] || 0,
    }));
}

const chartHandlers = {
    drainage: getDrainage,
    'ec-ph': getEcPh,
    watering: getWatering,
    starts: getStarts,
    'feed-ec': getFeedEc,
    'feed-ph': getFeedPh,
    'water-temp': getWaterTemp,
    'substrate-moisture': getSubstrateMoisture,
    consumption: getConsumption,
};

class ChartsController {
    async getChartData(req, res, next) {
        try {
            const { chartId } = req.params;
            const { dateFrom, dateTo } = req.query;

            const handler = chartHandlers[chartId];
            if (!handler) {
                return res.status(404).json({ message: 'Неизвестный график' });
            }

            if (!dateFrom || !dateTo) {
                return res.status(400).json({ message: 'Не переданы даты' });
            }

            const data = await handler({ dateFrom, dateTo });

            return res.json({ data });
        } catch (e) {
            console.error('CHARTS ERROR:', e);
            next(e);
        }
    }

    async getAvailableRange(req, res, next) {
        try {

            const candidates = [];

            const wMin = await WateringHistory.min('startTime');
            const wMax = await WateringHistory.max('startTime');
            if (wMin) candidates.push({ min: toDateOnly(wMin), max: toDateOnly(wMax) });

            const cMin = await DailyCondition.min('date');
            const cMax = await DailyCondition.max('date');
            if (cMin) candidates.push({ min: toDateOnly(cMin), max: toDateOnly(cMax) });

            const sMin = await SolutionHistory.min('date');
            const sMax = await SolutionHistory.max('date');
            if (sMin) candidates.push({ min: toDateOnly(sMin), max: toDateOnly(sMax) });


            if (!candidates.length) {
                return res.json({ min: null, max: null });
            }

            const min = candidates.reduce(
                (acc, c) => (c.min < acc ? c.min : acc),
                candidates[0].min
            );
            const max = candidates.reduce(
                (acc, c) => (c.max > acc ? c.max : acc),
                candidates[0].max
            );

            return res.json({ min, max });
        } catch (e) {
            console.error('CHARTS RANGE ERROR:', e);
            next(e);
        }
    }
}

module.exports = new ChartsController();