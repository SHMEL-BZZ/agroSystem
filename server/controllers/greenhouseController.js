const { GreenhouseBlock } = require('../models/models')
const ApiError = require('../error/ApiError')


class GreenhouseBlockController {

    // POST /api/greenhouse-block
    async create(req, res, next) {
        try {
            const { id, name, description } = req.body

            if (!name || name.trim().length === 0) {
                return next(ApiError.badRequest('Название обязательно'))
            }

            if (id) {
                const existing = await GreenhouseBlock.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Блок с таким id уже существует'))
                }
            }

            const block = await GreenhouseBlock.create({ id, name, description })
            return res.json(block)

        } catch (e) {
            console.error('GREENHOUSE BLOCK CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/greenhouse-block
    async getAll(req, res, next) {
        try {
            const blocks = await GreenhouseBlock.findAll()
            return res.json(blocks)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/greenhouse-block/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const block = await GreenhouseBlock.findByPk(id, {
                include: ['valves']  // если хотите сразу тянуть связанные клапаны
            })
            if (!block) {
                return next(ApiError.notFound('Блок не найден'))
            }
            return res.json(block)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // PUT /api/greenhouse-block/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const { name, description } = req.body

            const block = await GreenhouseBlock.findByPk(id)
            if (!block) {
                return next(ApiError.notFound('Блок не найден'))
            }

            await block.update({ name, description })
            return res.json(block)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/greenhouse-block/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const block = await GreenhouseBlock.findByPk(id)
            if (!block) {
                return next(ApiError.notFound('Блок не найден'))
            }
            await block.destroy()
            return res.json({ message: 'Блок удалён' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new GreenhouseBlockController()