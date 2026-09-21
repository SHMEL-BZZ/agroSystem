const { Additive } = require('../models/models')
const ApiError = require('../error/ApiError')

const VALID_UNITS = ['кг', 'л']


class AdditiveController {

    async create(req, res, next) {
        try {
            const { id, name, stockVolume, unit } = req.body

            if (!name || name.trim().length === 0) {
                return next(ApiError.badRequest('Название обязательно'))
            }
            if (unit && !VALID_UNITS.includes(unit)) {
                return next(ApiError.badRequest(`Единица измерения должна быть: ${VALID_UNITS.join(' или ')}`))
            }

            if (id) {
                const existing = await Additive.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Добавка с таким id уже существует'))
                }
            }

            const additive = await Additive.create({
                id, name, stockVolume, unit: unit || 'кг'
            })
            return res.json(additive)

        } catch (e) {
            console.error('ADDITIVE CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const additives = await Additive.findAll()
            return res.json(additives)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const additive = await Additive.findByPk(id)
            if (!additive) {
                return next(ApiError.notFound('Добавка не найдена'))
            }
            return res.json(additive)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            const { name, stockVolume, unit } = req.body

            const additive = await Additive.findByPk(id)
            if (!additive) {
                return next(ApiError.notFound('Добавка не найдена'))
            }

            if (unit && !VALID_UNITS.includes(unit)) {
                return next(ApiError.badRequest('Недопустимая единица измерения'))
            }

            await additive.update({ name, stockVolume, unit })
            return res.json(additive)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            const additive = await Additive.findByPk(id)
            if (!additive) {
                return next(ApiError.notFound('Добавка не найдена'))
            }
            await additive.destroy()
            return res.json({ message: 'Добавка удалена' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new AdditiveController()