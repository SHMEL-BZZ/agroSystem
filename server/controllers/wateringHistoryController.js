const { WateringHistory, DailyCondition, SolutionHistory } = require('../models/models')
const ApiError = require('../error/ApiError')
const { Op } = require('sequelize')


class WateringHistoryController {

    // POST /api/watering-history
    async create(req, res, next) {
        try {
            const {
                id, conditionId, solutionId, startTime,
                duration, waterVolume
            } = req.body

            if (!startTime) {
                return next(ApiError.badRequest('startTime обязателен'))
            }

            // Проверка FK (если переданы)
            if (conditionId) {
                const cond = await DailyCondition.findOne({
                    where: { id: conditionId }  // зависит от модели: id или составной ключ
                })
                if (!cond) return next(ApiError.badRequest('Условие не найдено'))
            }
            if (solutionId) {
                const sol = await SolutionHistory.findByPk(solutionId)
                if (!sol) return next(ApiError.badRequest('Раствор не найден'))
            }

            if (id) {
                const existing = await WateringHistory.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Полив с таким id уже существует'))
                }
            }

            const watering = await WateringHistory.create({
                id, conditionId, solutionId, startTime,
                duration, waterVolume
            })
            return res.json(watering)

        } catch (e) {
            console.error('WATERING HISTORY CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/watering-history?limit=50&offset=0&conditionId=1&solutionId=2&dateFrom=...&dateTo=...
    async getAll(req, res, next) {
        try {
            const {
                limit = 50, offset = 0,
                conditionId, solutionId,
                dateFrom, dateTo
            } = req.query

            const where = {}
            if (conditionId) where.conditionId = conditionId
            if (solutionId) where.solutionId = solutionId

            if (dateFrom || dateTo) {
                where.startTime = {}
                if (dateFrom) where.startTime[Op.gte] = new Date(dateFrom)
                if (dateTo) where.startTime[Op.lte] = new Date(dateTo)
            }

            const waterings = await WateringHistory.findAll({
                where,
                limit: Number(limit),
                offset: Number(offset),
                order: [['startTime', 'DESC']],
                include: [
                    { model: DailyCondition, as: 'condition' },
                    { model: SolutionHistory, as: 'solution' }
                ]
            })
            return res.json(waterings)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/watering-history/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const watering = await WateringHistory.findByPk(id, {
                include: [
                    { model: DailyCondition, as: 'condition' },
                    { model: SolutionHistory, as: 'solution' }
                ]
            })
            if (!watering) {
                return next(ApiError.notFound('Полив не найден'))
            }
            return res.json(watering)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // PUT /api/watering-history/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const {
                conditionId, solutionId, startTime,
                duration, waterVolume
            } = req.body

            const watering = await WateringHistory.findByPk(id)
            if (!watering) {
                return next(ApiError.notFound('Полив не найден'))
            }

            if (conditionId) {
                const cond = await DailyCondition.findByPk(conditionId)
                if (!cond) return next(ApiError.badRequest('Условие не найдено'))
            }
            if (solutionId) {
                const sol = await SolutionHistory.findByPk(solutionId)
                if (!sol) return next(ApiError.badRequest('Раствор не найден'))
            }

            await watering.update({
                conditionId, solutionId, startTime,
                duration, waterVolume
            })
            return res.json(watering)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/watering-history/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const watering = await WateringHistory.findByPk(id)
            if (!watering) {
                return next(ApiError.notFound('Полив не найден'))
            }
            await watering.destroy()
            return res.json({ message: 'Полив удалён' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new WateringHistoryController()