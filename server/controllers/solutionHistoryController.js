const { SolutionHistory, Tank } = require('../models/models')
const ApiError = require('../error/ApiError')

// исотрия раствора контроллер
class SolutionHistoryController {

    // POST /api/solution-history
    async create(req, res, next) {
        try {
            const { id, tankId, date, totalVolume } = req.body

            if (!tankId) {
                return next(ApiError.badRequest('tankId обязателен'))
            }

            // Проверка FK
            const tank = await Tank.findByPk(tankId)
            if (!tank) {
                return next(ApiError.badRequest('Бак не найден'))
            }

            if (id) {
                const existing = await SolutionHistory.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Запись с таким id уже существует'))
                }
            }

            const solution = await SolutionHistory.create({
                id, tankId, date, totalVolume
            })
            return res.json(solution)

        } catch (e) {
            console.error('SOLUTION HISTORY CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/solution-history?limit=50&offset=0&tankId=1&dateFrom=...&dateTo=...
    async getAll(req, res, next) {
        try {
            const { limit = 50, offset = 0, tankId, dateFrom, dateTo } = req.query

            const where = {}
            if (tankId) where.tankId = tankId

            // Фильтр по датам
            if (dateFrom || dateTo) {
                const { Op } = require('sequelize')
                where.date = {}
                if (dateFrom) where.date[Op.gte] = new Date(dateFrom)
                if (dateTo) where.date[Op.lte] = new Date(dateTo)
            }

            const solutions = await SolutionHistory.findAll({
                where,
                limit: Number(limit),
                offset: Number(offset),
                order: [['date', 'DESC']],
                include: [{ model: Tank, as: 'tank' }]
            })
            return res.json(solutions)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/solution-history/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const solution = await SolutionHistory.findByPk(id, {
                include: [
                    { model: Tank, as: 'tank' }
                    // если хотите состав — раскомментируйте
                    // { model: SolutionComposition, as: 'composition' }
                ]
            })
            if (!solution) {
                return next(ApiError.notFound('Запись не найдена'))
            }
            return res.json(solution)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // PUT /api/solution-history/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const { tankId, date, totalVolume } = req.body

            const solution = await SolutionHistory.findByPk(id)
            if (!solution) {
                return next(ApiError.notFound('Запись не найдена'))
            }

            if (tankId) {
                const tank = await Tank.findByPk(tankId)
                if (!tank) return next(ApiError.badRequest('Бак не найден'))
            }

            await solution.update({ tankId, date, totalVolume })
            return res.json(solution)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/solution-history/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const solution = await SolutionHistory.findByPk(id)
            if (!solution) {
                return next(ApiError.notFound('Запись не найдена'))
            }
            await solution.destroy()
            return res.json({ message: 'Запись удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new SolutionHistoryController()