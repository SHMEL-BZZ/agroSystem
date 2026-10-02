const { DrainHistory, WateringHistory } = require('../models/models')
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize')


class DrainHistoryController {

    // POST /api/drain-history
    async create(req, res, next) {
        try {
            const { id, wateringId, measurementTime, drainVolume } = req.body

            if (!wateringId) {
                return next(ApiError.badRequest('wateringId обязателен'))
            }

            // Проверка FK
            const watering = await WateringHistory.findByPk(wateringId)
            if (!watering) {
                return next(ApiError.badRequest('Полив не найден'))
            }

            if (id) {
                const existing = await DrainHistory.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Дренаж с таким id уже существует'))
                }
            }

            const drain = await DrainHistory.create({
                id, wateringId, measurementTime, drainVolume
            })
            return res.json(drain)

        } catch (e) {
            console.error('DRAIN HISTORY CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/drain-history?limit=50&offset=0&wateringId=1&dateFrom=...&dateTo=...
    async getAll(req, res, next) {
        try {
            const {
                limit = 50, offset = 0,
                wateringId, dateFrom, dateTo
            } = req.query

            const where = {}
            if (wateringId) where.wateringId = wateringId

            if (dateFrom || dateTo) {
                where.measurementTime = {}
                if (dateFrom) where.measurementTime[Op.gte] = new Date(dateFrom)
                if (dateTo) where.measurementTime[Op.lte] = new Date(dateTo)
            }

            const drains = await DrainHistory.findAll({
                where,
                limit: Number(limit),
                offset: Number(offset),
                order: [['measurementTime', 'DESC']],
                include: [{ model: WateringHistory, as: 'watering' }]
            })
            return res.json(drains)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/drain-history/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const drain = await DrainHistory.findByPk(id, {
                include: [{ model: WateringHistory, as: 'watering' }]
            })
            if (!drain) {
                return next(ApiError.notFound('Запись не найдена'))
            }
            return res.json(drain)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // PUT /api/drain-history/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const { wateringId, measurementTime, drainVolume } = req.body

            const drain = await DrainHistory.findByPk(id)
            if (!drain) {
                return next(ApiError.notFound('Запись не найдена'))
            }

            if (wateringId) {
                const watering = await WateringHistory.findByPk(wateringId)
                if (!watering) return next(ApiError.badRequest('Полив не найден'))
            }

            await drain.update({ wateringId, measurementTime, drainVolume })
            return res.json(drain)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/drain-history/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const drain = await DrainHistory.findByPk(id)
            if (!drain) {
                return next(ApiError.notFound('Запись не найдена'))
            }
            await drain.destroy()
            return res.json({ message: 'Запись удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new DrainHistoryController()