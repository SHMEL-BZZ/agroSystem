const { DailyCondition, Valve } = require('../models/models')
const ApiError = require('../error/ApiError')


class DailyConditionController {

    async create(req, res, next) {
        try {
            const {
                valveId, date, dayTemperature, weather,
                avgHumidity, avgConductivity, avgPh
            } = req.body

            if (!valveId || !date) {
                return next(ApiError.badRequest('valveId и date обязательны'))
            }

            const valve = await Valve.findByPk(valveId)
            if (!valve) {
                return next(ApiError.badRequest('Клапан не найден'))
            }

            const existing = await DailyCondition.findOne({
                where: { valveId, date }
            })
            if (existing) {
                return next(ApiError.badRequest('Условие для этого клапана и даты уже существует'))
            }

            const condition = await DailyCondition.create({
                valveId, date, dayTemperature, weather,
                avgHumidity, avgConductivity, avgPh
            })
            return res.json(condition)

        } catch (e) {
            console.error('DAILY CONDITION CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const { valveId, dateFrom, dateTo, limit = 100, offset = 0 } = req.query
            const { Op } = require('sequelize')

            const where = {}
            if (valveId) where.valveId = valveId
            if (dateFrom || dateTo) {
                where.date = {}
                if (dateFrom) where.date[Op.gte] = dateFrom
                if (dateTo) where.date[Op.lte] = dateTo
            }

            const conditions = await DailyCondition.findAll({
                where,
                limit: Number(limit),
                offset: Number(offset),
                order: [['date', 'DESC']],
                include: [{ model: Valve, as: 'valve' }]
            })
            return res.json(conditions)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/condition/:valveId/:date
    async getOne(req, res, next) {
        try {
            const { valveId, date } = req.params
            const condition = await DailyCondition.findOne({
                where: { valveId, date },
                include: [{ model: Valve, as: 'valve' }]
            })
            if (!condition) {
                return next(ApiError.notFound('Условие не найдено'))
            }
            return res.json(condition)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { valveId, date } = req.params
            const {
                dayTemperature, weather,
                avgHumidity, avgConductivity, avgPh
            } = req.body

            const condition = await DailyCondition.findOne({
                where: { valveId, date }
            })
            if (!condition) {
                return next(ApiError.notFound('Условие не найдено'))
            }

            await condition.update({
                dayTemperature, weather,
                avgHumidity, avgConductivity, avgPh
            })
            return res.json(condition)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { valveId, date } = req.params
            const condition = await DailyCondition.findOne({
                where: { valveId, date }
            })
            if (!condition) {
                return next(ApiError.notFound('Условие не найдено'))
            }
            await condition.destroy()
            return res.json({ message: 'Условие удалено' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new DailyConditionController()