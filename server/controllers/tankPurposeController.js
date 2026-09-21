const { TankPurpose } = require('../models/models')
const ApiError = require('../error/ApiError')


class TankPurposeController {

    async create(req, res, next) {
        try {
            const { id, description } = req.body

            if (!description || description.trim().length === 0) {
                return next(ApiError.badRequest('Описание обязательно'))
            }

            if (id) {
                const existing = await TankPurpose.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Назначение с таким id уже существует'))
                }
            }

            const purpose = await TankPurpose.create({ id, description })
            return res.json(purpose)

        } catch (e) {
            console.error('TANK PURPOSE CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const purposes = await TankPurpose.findAll()
            return res.json(purposes)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const purpose = await TankPurpose.findByPk(id, {
                include: ['tanks']
            })
            if (!purpose) {
                return next(ApiError.notFound('Назначение не найдено'))
            }
            return res.json(purpose)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            const { description } = req.body

            const purpose = await TankPurpose.findByPk(id)
            if (!purpose) {
                return next(ApiError.notFound('Назначение не найдено'))
            }

            if (!description || description.trim().length === 0) {
                return next(ApiError.badRequest('Описание обязательно'))
            }

            await purpose.update({ description })
            return res.json(purpose)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            const purpose = await TankPurpose.findByPk(id)
            if (!purpose) {
                return next(ApiError.notFound('Назначение не найдено'))
            }
            await purpose.destroy()
            return res.json({ message: 'Назначение удалено' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new TankPurposeController()