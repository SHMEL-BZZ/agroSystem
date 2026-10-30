const { Valve, GreenhouseBlock } = require('../models/models');
const ApiError = require('../error/ApiError');

const VALID_TYPES = ['электромагнитный', 'шаровый', 'дисковый', 'игольчатый'];
const VALID_STATES = ['работает', 'отключен', 'аварийное'];

const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? null : n;
};

class ValveController {
    async create(req, res, next) {
        try {
            const { manufacturer, model, constructionType, diameter, state } = req.body;

            // Обязательные поля
            if (!model || !String(model).trim()) {
                return next(ApiError.badRequest('Укажите модель клапана'));
            }
            if (!manufacturer || !String(manufacturer).trim()) {
                return next(ApiError.badRequest('Укажите производителя'));
            }
            if (!constructionType) {
                return next(ApiError.badRequest('Укажите тип конструкции'));
            }

            if (!VALID_TYPES.includes(constructionType)) {
                return next(
                    ApiError.badRequest(
                        `тип_конструкции должен быть одним из: ${VALID_TYPES.join(', ')}`
                    )
                );
            }
            if (state && !VALID_STATES.includes(state)) {
                return next(
                    ApiError.badRequest(
                        `состояние должно быть одним из: ${VALID_STATES.join(', ')}`
                    )
                );
            }

            // Проверка на дубликат модели (case-insensitive, с trim)
            const modelNormalized = String(model).trim();
            const existing = await Valve.findOne({ where: { model: modelNormalized } });
            if (existing) {
                return next(
                    ApiError.badRequest(`Клапан с моделью «${modelNormalized}» уже существует`)
                );
            }

            // Обработка диаметра: пустая строка / null → null, иначе число
            let diameterValue = null;
            if (diameter !== undefined && diameter !== null && diameter !== '') {
                diameterValue = parseFloat(diameter);
                if (Number.isNaN(diameterValue) || diameterValue < 0) {
                    return next(ApiError.badRequest('Некорректный диаметр'));
                }
            }

            // id НЕ передаём — autoIncrement сделает всё сам
            const valve = await Valve.create({
                manufacturer: String(manufacturer).trim(),
                model: modelNormalized,
                constructionType,
                diameter: diameterValue,
                state: state || 'работает',
            });

            return res.json(valve);
        } catch (e) {
            console.error('VALVE CREATE ERROR:', e);
            return next(ApiError.internal(e.message));
        }
    }

    async getAll(req, res, next) {
        try {
            const valves = await Valve.findAll({
                include: [{ model: GreenhouseBlock, as: 'blocks' }],
                order: [['id', 'ASC']],
            });
            return res.json(valves);
        } catch (e) {
            console.error('VALVE GET ALL ERROR:', e);
            return next(ApiError.internal(e.message));
        }
    }

    async getOne(req, res, next) {
        try {
            const id = toInt(req.params.id);
            if (!id) return next(ApiError.badRequest('Некорректный id'));

            const valve = await Valve.findByPk(id, {
                include: [{ model: GreenhouseBlock, as: 'blocks' }],
            });
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'));
            }
            return res.json(valve);
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async update(req, res, next) {
        try {
            const id = toInt(req.params.id);
            if (!id) return next(ApiError.badRequest('Некорректный id'));

            const { manufacturer, model, constructionType, diameter, state } = req.body;

            const valve = await Valve.findByPk(id);
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'));
            }

            if (constructionType && !VALID_TYPES.includes(constructionType)) {
                return next(ApiError.badRequest('Недопустимый тип конструкции'));
            }
            if (state && !VALID_STATES.includes(state)) {
                return next(ApiError.badRequest('Недопустимое состояние'));
            }

            // Если меняют модель — проверить, что новая не занята другим клапаном
            if (model && String(model).trim() !== valve.model) {
                const modelNormalized = String(model).trim();
                const duplicate = await Valve.findOne({
                    where: { model: modelNormalized },
                });
                if (duplicate && duplicate.id !== valve.id) {
                    return next(
                        ApiError.badRequest(
                            `Клапан с моделью «${modelNormalized}» уже существует`
                        )
                    );
                }
            }

            const patch = {};
            if (manufacturer !== undefined) patch.manufacturer = String(manufacturer).trim();
            if (model !== undefined) patch.model = String(model).trim();
            if (constructionType !== undefined) patch.constructionType = constructionType;
            if (state !== undefined) patch.state = state;
            if (diameter !== undefined) {
                patch.diameter =
                    diameter === '' || diameter === null
                        ? null
                        : parseFloat(diameter);
            }

            await valve.update(patch);
            return res.json(valve);
        } catch (e) {
            console.error('VALVE UPDATE ERROR:', e);
            return next(ApiError.internal(e.message));
        }
    }

    async delete(req, res, next) {
        try {
            const id = toInt(req.params.id);
            if (!id) return next(ApiError.badRequest('Некорректный id'));

            const valve = await Valve.findByPk(id);
            if (!valve) {
                return next(ApiError.notFound('Клапан не найден'));
            }
            await valve.destroy();
            return res.json({ message: 'Клапан удалён' });
        } catch (e) {
            return next(ApiError.internal(e.message));
        }
    }

    async addGreenhouse(req, res) {
        try {
            const id = toInt(req.params.id);
            if (!id) return res.status(400).json({ message: 'Некорректный id клапана' });

            const { blockId, name, description } = req.body;

            const valve = await Valve.findByPk(id);
            if (!valve) {
                return res.status(404).json({ message: 'Клапан не найден' });
            }

            let block;

            if (blockId) {
                // Привязка существующей
                block = await GreenhouseBlock.findByPk(blockId);
                if (!block) {
                    return res.status(404).json({ message: 'Теплица не найдена' });
                }
            } else if (name && String(name).trim()) {
                // Создание новой + привязка
                const nameNormalized = String(name).trim();
                const duplicate = await GreenhouseBlock.findOne({
                    where: { name: nameNormalized },
                });
                if (duplicate) {
                    return res
                        .status(400)
                        .json({ message: `Теплица с названием «${nameNormalized}» уже существует` });
                }
                block = await GreenhouseBlock.create({
                    name: nameNormalized,
                    description: description || null,
                });
            } else {
                return res.status(400).json({
                    message: 'Укажите blockId существующей теплицы или name для новой',
                });
            }

            await valve.addBlock(block);
            return res.json({ message: 'Теплица успешно привязана к клапану', block });
        } catch (error) {
            console.error('ADD GREENHOUSE ERROR:', error);
            return res.status(500).json({ message: 'Ошибка при привязке теплицы' });
        }
    }

    async removeGreenhouse(req, res) {
        try {
            const id = toInt(req.params.id);
            const blockId = toInt(req.params.blockId);
            if (!id || !blockId) {
                return res.status(400).json({ message: 'Некорректные id' });
            }

            const valve = await Valve.findByPk(id);
            if (!valve) return res.status(404).json({ message: 'Клапан не найден' });

            const block = await GreenhouseBlock.findByPk(blockId);
            if (!block) return res.status(404).json({ message: 'Теплица не найдена' });

            await valve.removeBlock(block);
            return res.json({ message: 'Теплица отвязана от клапана' });
        } catch (error) {
            console.error('REMOVE GREENHOUSE ERROR:', error);
            return res.status(500).json({ message: 'Ошибка при отвязке' });
        }
    }
}

module.exports = new ValveController();