const {
    WateringSchedule,
    ScheduleTank,
    ScheduleValve,
    Tank,
    Valve,
    sequelize,
} = require('../models/models')
const ApiError = require('../error/ApiError')

class WateringScheduleController {
    // GET /api/watering-schedule?date=YYYY-MM-DD
    async getByDate(req, res, next) {
        try {
            const { date } = req.query
            if (!date) return next(ApiError.badRequest('Параметр date обязателен'))

            const rows = await WateringSchedule.findAll({
                where: { date },
                order: [['periodNumber', 'ASC']],
                include: [
                    {
                        model: Tank,
                        as: 'tanks',
                        through: { attributes: ['volume'] },
                    },
                    {
                        model: Valve,
                        as: 'valves',
                        through: { attributes: ['volume'] },
                    },
                ],
            })

            // Преобразуем в удобный формат для клиента
            const result = rows.map((r) => ({
                id: r.id,
                date: r.date,
                periodNumber: r.periodNumber,
                startTime: r.startTime,
                durationMin: r.durationMin,
                periodVolume: r.periodVolume,
                tanks: (r.tanks || []).map((t) => ({
                    tankId: t.id,
                    volume: t.ScheduleTank?.volume,
                })),
                valves: (r.valves || []).map((v) => ({
                    valveId: v.id,
                    volume: v.ScheduleValve?.volume,
                })),
            }))

            return res.json(result)
        } catch (e) {
            console.error('SCHEDULE GET ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // POST /api/watering-schedule
    // body: { date, periods: [{ start, duration, volume, tanks, valves }] }
    async save(req, res, next) {
        const transaction = await sequelize.transaction()
        try {
            const { date, periods } = req.body
            if (!date || !Array.isArray(periods)) {
                await transaction.rollback()
                return next(ApiError.badRequest('date и periods обязательны'))
            }

            // Удаляем старое расписание (каскадно удалятся и связанные строки)
            await WateringSchedule.destroy({
                where: { date },
                transaction,
            })

            const created = []

            for (let i = 0; i < periods.length; i++) {
                const p = periods[i]

                const schedule = await WateringSchedule.create(
                    {
                        date,
                        periodNumber: i + 1,
                        startTime: p.start,
                        durationMin: parseInt(p.duration, 10) || 0,
                        periodVolume: parseFloat(p.volume) || 0,
                    },
                    { transaction }
                )

                // Привязка баков
                for (const t of p.tanks || []) {
                    if (!t.tankId || !(parseFloat(t.volume) > 0)) continue
                    await ScheduleTank.create(
                        {
                            scheduleId: schedule.id,
                            tankId: Number(t.tankId),
                            volume: parseFloat(t.volume),
                        },
                        { transaction }
                    )
                }

                // Привязка клапанов
                for (const [valveId, v] of Object.entries(p.valves || {})) {
                    if (!v.enabled || !(parseFloat(v.volume) > 0)) continue
                    await ScheduleValve.create(
                        {
                            scheduleId: schedule.id,
                            valveId: Number(valveId),
                            volume: parseFloat(v.volume),
                        },
                        { transaction }
                    )
                }

                created.push(schedule)
            }

            await transaction.commit()
            return res.json({
                message: `Сохранено ${created.length} период(ов)`,
                count: created.length,
            })
        } catch (e) {
            await transaction.rollback()
            console.error('SCHEDULE SAVE ERROR:', e)
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