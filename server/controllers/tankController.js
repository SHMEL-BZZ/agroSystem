const { Tank, TankPurpose, SolutionHistory, SolutionComposition, Additive } = require('../models/models')
const ApiError = require('../error/ApiError')


class TankController {

    async create(req, res, next) {
        try {
            const { id, volume, purposeId } = req.body

            if (volume === undefined || volume === null) {
                return next(ApiError.badRequest('Объём обязателен'))
            }
            if (Number(volume) <= 0) {
                return next(ApiError.badRequest('Объём должен быть больше 0'))
            }

            if (purposeId) {
                const purpose = await TankPurpose.findByPk(purposeId)
                if (!purpose) {
                    return next(ApiError.badRequest('Назначение бака не найдено'))
                }
            }

            if (id) {
                const existing = await Tank.findByPk(id)
                if (existing) {
                    return next(ApiError.badRequest('Бак с таким id уже существует'))
                }
            }

            const tank = await Tank.create({ id, volume, purposeId })
            return res.json(tank)

        } catch (e) {
            console.error('TANK CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            const tanks = await Tank.findAll({
                include: [{ model: TankPurpose, as: 'purpose' }]
            })
            return res.json(tanks)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/tank/with-contents
    // Возвращает баки + текущий состав из последнего раствора каждого бака
    async getAllWithContents(req, res, next) {
        try {
            const tanks = await Tank.findAll({
                include: [{ model: TankPurpose, as: 'purpose' }],
                order: [['id', 'ASC']]
            })

            const result = []

            for (const tank of tanks) {
                // Ищем последний раствор в этом баке + его состав
                const lastSolution = await SolutionHistory.findOne({
                    where: { tankId: tank.id },
                    order: [['date', 'DESC']],
                    include: [{
                        model: SolutionComposition,
                        as: 'composition',
                        include: [{ model: Additive, as: 'additive' }]
                    }]
                })

                const items = []

                if (lastSolution) {
                    // Вода = общий_объем минус сумма добавок
                    const additivesSum = (lastSolution.composition || []).reduce(
                        (s, c) => s + parseFloat(c.amount || 0), 0
                    )
                    const totalVolume = parseFloat(lastSolution.totalVolume || 0)
                    const waterVolume = Math.max(0, totalVolume - additivesSum)

                    if (waterVolume > 0) {
                        items.push({
                            kind: 'water',
                            name: 'Вода',
                            amount: Number(waterVolume.toFixed(2)),
                            unit: 'л'
                        })
                    }

                    (lastSolution.composition || []).forEach(c => {
                        items.push({
                            kind: 'additive',
                            name: c.additive?.name || 'Добавка',
                            amount: parseFloat(c.amount),
                            unit: c.unit || 'г'
                        })
                    })
                }

                // Считаем использованные литры (только вода, не добавки)
                const usedLiters = items
                    .filter(i => i.unit === 'л')
                    .reduce((s, i) => s + i.amount, 0)

                result.push({
                    id: tank.id,
                    name: `Бак ${tank.id}`,
                    volume: parseFloat(tank.volume),
                    purpose: tank.purpose?.description || null,
                    usedLiters,
                    items
                })
            }

            return res.json(result)
        } catch (e) {
            console.error('TANK GET WITH CONTENTS ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const tank = await Tank.findByPk(id, {
                include: [{ model: TankPurpose, as: 'purpose' }]
            })
            if (!tank) {
                return next(ApiError.notFound('Бак не найден'))
            }
            return res.json(tank)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params
            const { volume, purposeId } = req.body

            const tank = await Tank.findByPk(id)
            if (!tank) {
                return next(ApiError.notFound('Бак не найден'))
            }

            if (volume !== undefined && Number(volume) <= 0) {
                return next(ApiError.badRequest('Объём должен быть больше 0'))
            }

            if (purposeId) {
                const purpose = await TankPurpose.findByPk(purposeId)
                if (!purpose) {
                    return next(ApiError.badRequest('Назначение не найдено'))
                }
            }

            await tank.update({ volume, purposeId })
            return res.json(tank)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params
            const tank = await Tank.findByPk(id)
            if (!tank) {
                return next(ApiError.notFound('Бак не найден'))
            }
            await tank.destroy()
            return res.json({ message: 'Бак удалён' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }
}

module.exports = new TankController()