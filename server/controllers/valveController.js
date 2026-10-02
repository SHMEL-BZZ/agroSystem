const { Valve, GreenhouseBlock } = require('../models/models')
const ApiError = require('../error/ApiError')

const VALID_TYPES = ['электромагнитный', 'шаровый', 'дисковый', 'игольчатый']
const VALID_STATES = ['работает', 'отключен', 'аварийное']

// контроллер для модели клапанов
class ValveController {

    // POST /api/valve
    async create(req, res, next) {
        try {
            const { id, manufacturer, model, constructionType, diameter, state } = req.body

            if (!id) {
                return next(ApiError.badRequest('id_клапана обязателен'))
            }
            if (constructionType && !VALID_TYPES.includes(constructionType)) {
                return next(ApiError.badRequest(
                    `тип_конструкции должен быть одним из: ${VALID_TYPES.join(', ')}`
                ))
            }
            if (state && !VALID_STATES.includes(state)) {
                return next(ApiError.badRequest(
                    `состояние должно быть одним из: ${VALID_STATES.join(', ')}`
                ))
            }

            const existing = await Valve.findByPk(id)
            if (existing) {
                return next(ApiError.badRequest('Клапан с таким id уже существует'))
            }

            const valve = await Valve.create({
                id, manufacturer, model,
                constructionType,
                diameter,
                state: state || 'работает'
            })
            return res.json(valve)

        } catch (e) {
            console.error('VALVE CREATE ERROR:', e)
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/valve
    async getAll(req, res, next) {
        try {
            const valves = await Valve.findAll({ include: ['blocks'] })
            return res.json(valves)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // GET /api/valve/:id
    async getOne(req, res, next) {
        try {
            const { id } = req.params
            const valve = await Valve.findByPk(id)
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'))
            }
            return res.json(valve)
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // PUT /api/valve/:id
    async update(req, res, next) {
        try {
            const { id } = req.params
            const { manufacturer, model, constructionType, diameter, state } = req.body

            const valve = await Valve.findByPk(id)
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'))
            }

            if (constructionType && !VALID_TYPES.includes(constructionType)) {
                return next(ApiError.badRequest('Недопустимый тип конструкции'))
            }
            if (state && !VALID_STATES.includes(state)) {
                return next(ApiError.badRequest('Недопустимое состояние'))
            }

            await valve.update({ manufacturer, model, constructionType, diameter, state })
            return res.json(valve)

        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    // DELETE /api/valve/:id
    async delete(req, res, next) {
        try {
            const { id } = req.params
            const valve = await Valve.findByPk(id)
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'))
            }
            await valve.destroy()
            return res.json({ message: 'Клапан удалён' })
        } catch (e) {
            return next(ApiError.internal(e.message))
        }
    }

    async addGreenhouse(req, res) {
        try {
            const { id } = req.params; // id клапана
            const { blockId, name, description } = req.body;

            const valve = await Valve.findByPk(id);
            if (!valve) {
                return res.status(404).json({ message: 'Клапан не найден' });
            }

            let block;

            if (blockId) {
                // Вариант 1: Привязываем существующую теплицу
                block = await GreenhouseBlock.findByPk(blockId);
                if (!block) {
                    return res.status(404).json({ message: 'Теплица не найдена' });
                }
            } else if (name) {
                // Вариант 2: Создаем новую теплицу и сразу привязываем
                block = await GreenhouseBlock.create({ name, description });
            } else {
                return res.status(400).json({ message: 'Укажите blockId существующей теплицы или name для новой' });
            }

            // Используем магический метод Sequelize для связи M2M (alias 'blocks' из вашей модели)
            await valve.addBlock(block);

            return res.json({ message: 'Теплица успешно привязана к клапану', block });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при привязке теплицы' });
        }
    }

    // отвязка теплицы от клапана
    async removeGreenhouse(req, res) {
        try {
            const { id, blockId } = req.params;

            const valve = await Valve.findByPk(id);
            if (!valve) return res.status(404).json({ message: 'Клапан не найден' });

            const block = await GreenhouseBlock.findByPk(blockId);
            if (!block) return res.status(404).json({ message: 'Теплица не найдена' });

            await valve.removeBlock(block); // Метод Sequelize для удаления связи

            return res.json({ message: 'Теплица отвязана от клапана' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Ошибка при отвязке' });
        }
    }
}

module.exports = new ValveController()