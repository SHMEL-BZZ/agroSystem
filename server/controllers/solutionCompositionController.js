const { SolutionComposition, SolutionHistory, Additive } = require('../models/models')
const ApiError = require('../error/ApiError')

const VALID_UNITS = ['кг', 'л']


class SolutionCompositionController {

    async create(req, res, next) {
        try {
            const { id, solutionId, additiveId, amount, unit } = req.body

            if (!solutionId || !additiveId || amount === undefined) {
                return next(ApiError.badRequest('solutionId, additiveId и amount обязательны'))
            }
            if (Number(amount) <= 0) {
                return next(ApiError.badRequest('Количество должно быть больше 0'))
            }
            if (unit && !VALID_UNITS.includes(unit)) {
                return next(ApiError.badRequest('Недопустимая единица измерения'))
            }

            const solution = await SolutionHistory.findByPk(solutionId)
            if (!solution) return next(ApiError.badRequest('Раствор не найден'))

            const additive = await Additive.findByPk(additiveId)
            if (!additive) return next(ApiError.badRequest('Добавка не найдена'))

            if (id) {
                const existing = await SolutionComposition.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Состав с таким id уже существует'))
                }
            }

            const composition = await SolutionComposition.create({
                id, solutionId, additiveId, amount, unit
            })
            return res.json(composition)

        } catch (e) {
            console.error('SOLUTION COMPOSITION CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const compositions = await SolutionComposition.findAll({
                include: [
                    { model: SolutionHistory, as: 'solution' },
                    { model: Additive, as: 'additive' }
                ]
            })
            return res.json(compositions)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const composition = await SolutionComposition.findByPk(id, {
                include: [
                    { model: SolutionHistory, as: 'solution' },
                    { model: Additive, as: 'additive' }
                ]
            })
            if (!composition) {
                return next(ApiError.notFound('Состав не найден'))
            }
            return res.json(composition)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            const { solutionId, additiveId, amount, unit } = req.body

            const composition = await SolutionComposition.findByPk(id)
            if (!composition) {
                return next(ApiError.notFound('Состав не найден'))
            }

            if (amount !== undefined && Number(amount) <= 0) {
                return next(ApiError.badRequest('Количество должно быть больше 0'))
            }
            if (unit && !VALID_UNITS.includes(unit)) {
                return next(ApiError.badRequest('Недопустимая единица измерения'))
            }

            if (solutionId) {
                const solution = await SolutionHistory.findByPk(solutionId)
                if (!solution) return next(ApiError.badRequest('Раствор не найден'))
            }
            if (additiveId) {
                const additive = await Additive.findByPk(additiveId)
                if (!additive) return next(ApiError.badRequest('Добавка не найдена'))
            }

            await composition.update({ solutionId, additiveId, amount, unit })
            return res.json(composition)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            const composition = await SolutionComposition.findByPk(id)
            if (!composition) {
                return next(ApiError.notFound('Состав не найден'))
            }
            await composition.destroy()
            return res.json({ message: 'Состав удалён' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new SolutionCompositionController()