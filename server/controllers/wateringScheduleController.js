const { WateringSchedule } = require('../models/models')

const ApiError = require('../error/ApiError')

class WateringScheduleController {
    // GET /api/watering-schedule?date=YYYY-MM-DD
    async getByDate(req, res, next) {
        try {
            const { date } = req.query
            if (!date) return next(ApiError.badRequest('Параметр date обязателен'))

            const rows = await WateringSchedule.findAll({
                where: { date },
                order: [['periodNumber', 'ASC']]
            })
            return res.json(rows)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // POST /api/watering-schedule
    // body: { date, periods: [{ name, start, duration, volume, tanks, valves }] }
    async save(req, res, next) {
        try {
            const { date, periods } = req.body
            if (!date || !Array.isArray(periods)) {
                return next(ApiError.badRequest('date и periods обязательны'))
            }

            // Полностью перезаписываем расписание на эту дату
            await WateringSchedule.destroy({ where: { date } })

            const created = []
            for (let i = 0; i < periods.length; i++) {
                const p = periods[i]

                // Распределение по бакам: [{ tankId, volume }]
                const tankDistribution = (p.tanks || [])
                    .filter(t => t.tankId && parseFloat(t.volume) > 0)
                    .map(t => ({
                        tankId: Number(t.tankId),
                        volume: parseFloat(t.volume)
                    }))

                // Распределение по клапанам: [{ valveId, volume }]
                const valveDistribution = Object.entries(p.valves || {})
                    .filter(([_, v]) => v.enabled && parseFloat(v.volume) > 0)
                    .map(([valveId, v]) => ({
                        valveId: Number(valveId),
                        volume: parseFloat(v.volume)
                    }))

                const row = await WateringSchedule.create({
                    date,
                    periodNumber: i + 1,
                    startTime: p.start,
                    durationMin: parseInt(p.duration, 10) || 0,
                    periodVolume: parseFloat(p.volume) || 0,
                    tankDistribution,
                    valveDistribution
                })

                created.push(row)
            }

            return res.json({
                message: `Сохранено ${created.length} период(ов)`,
                rows: created
            })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/watering-schedule?date=YYYY-MM-DD
    async remove(req, res, next) {
        try {
            const { date } = req.query
            if (!date) return next(ApiError.badRequest('Параметр date обязателен'))
            await WateringSchedule.destroy({ where: { date } })
            return res.json({ message: 'Удалено' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new WateringScheduleController()