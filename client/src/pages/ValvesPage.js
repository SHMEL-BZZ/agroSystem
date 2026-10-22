import React, { useState, useEffect } from 'react';
import './ValvesPage.css';
import {
    fetchValves,
    linkGreenhouseToValve,
    unlinkGreenhouseFromValve,
    createValve,
} from '../http/valveAPI';
import { fetchGreenhouses } from '../http/greenhouseAPI';

/**
 * Ограничения на вводимые значения для полей формы.
 * @type {Object.<string, {min: number, max: number, label: string}>}
 */
const LIMITS = {
    valveManufacturer: { min: 2, max: 50, label: 'Производитель' },
    valveModel: { min: 1, max: 50, label: 'Модель' },
    valveDiameter: { min: 0.01, max: 300, label: 'Диаметр' },
    greenhouseName: { min: 2, max: 100, label: 'Название теплицы' },
    greenhouseDescription: { min: 0, max: 500, label: 'Описание' },
};

/**
 * Регулярное выражение для проверки допустимых символов в строковых полях.
 * Разрешены кириллица, латиница, цифры, пробелы и знаки пунктуации.
 * @type {RegExp}
 */
const RE_ALLOWED = /^[а-яёa-z0-9\s.,\-_/'"()]+$/i;

/**
 * Валидация строкового поля: обязательность, длина, допустимые символы.
 * @param {string} value — значение поля.
 * @param {{min?: number, max?: number, label: string}} limits — ограничения.
 * @param {{required?: boolean, pattern?: RegExp}} options — дополнительные правила.
 * @returns {string} — текст ошибки или пустая строка, если ошибки нет.
 */
function validateString(value, { min, max, label }, { required = false, pattern = null } = {}) {
    const v = (value ?? '').toString().trim();
    if (required && !v) return `${label} — обязательное поле`;
    if (!v) return '';
    if (min !== undefined && v.length < min) return `${label}: минимум ${min} символов`;
    if (max !== undefined && v.length > max) return `${label}: максимум ${max} символов`;
    if (pattern && !pattern.test(v)) return `${label}: недопустимые символы`;
    return '';
}

/**
 * Валидация числового поля: диапазон, количество знаков после запятой.
 * Принимает как точку, так и запятую в качестве разделителя.
 * @param {string|number} value — значение поля.
 * @param {{min?: number, max?: number, label: string}} limits — ограничения.
 * @param {{required?: boolean}} options — дополнительные правила.
 * @returns {string} — текст ошибки или пустая строка, если ошибки нет.
 */
function validateNumber(value, { min, max, label }, { required = false } = {}) {
    const v = (value ?? '').toString().trim();
    if (required && !v) return `${label} — обязательное поле`;
    if (!v) return '';

    if (!/^-?\d+([.,]\d+)?$/.test(v)) {
        return `${label}: только число (например, 25.40)`;
    }

    const normalized = v.replace(',', '.');
    const n = Number(normalized);
    if (Number.isNaN(n)) return `${label}: введите число`;

    if (min !== undefined && n < min) return `${label}: минимум ${min}`;
    if (max !== undefined && n > max) return `${label}: максимум ${max}`;

    const decimals = (normalized.split('.')[1] || '').length;
    if (decimals > 2) return `${label}: не более 2 знаков после запятой`;

    return '';
}

/** @type {{value: string, label: string}[]} Допустимые типы конструкции клапана. */
const CONSTRUCTION_TYPES = [
    { value: 'электромагнитный', label: 'Электромагнитный' },
    { value: 'шаровый', label: 'Шаровый' },
    { value: 'дисковый', label: 'Дисковый' },
    { value: 'игольчатый', label: 'Игольчатый' },
];

/** @type {{value: string, label: string}[]} Допустимые состояния клапана. */
const VALVE_STATES = [
    { value: 'работает', label: 'Работает' },
    { value: 'отключен', label: 'Отключен' },
    { value: 'аварийное', label: 'Аварийное' },
];

/**
 * Страница управления клапанами и привязки теплиц.
 *
 * Контракт:
 *  - Вход: пропсов нет; данные получаются из API-обёрток valveAPI и greenhouseAPI.
 *  - Результат: React-элемент (JSX) со списком клапанов, теплицами активного клапана,
 *    модалками добавления теплицы, создания клапана и подтверждения удаления.
 *  - Побочные эффекты: HTTP-запросы при монтировании и действиях пользователя.
 *  - Состояние: локальное (useState), наружу не выходит.
 *
 * @returns {JSX.Element}
 */
const ValvesPage = () => {
    const [valves, setValves] = useState([]);
    const [greenhouses, setGreenhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeValveId, setActiveValveId] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState('existing');
    const [selectedFreeId, setSelectedFreeId] = useState('');
    const [newGreenhouseName, setNewGreenhouseName] = useState('');
    const [newGreenhouseDescription, setNewGreenhouseDescription] = useState('');
    const [greenhouseErrors, setGreenhouseErrors] = useState({
        name: '',
        description: '',
    });

    const [greenhouseToRemove, setGreenhouseToRemove] = useState(null);

    const [isValveModalOpen, setIsValveModalOpen] = useState(false);
    const [valveForm, setValveForm] = useState({
        manufacturer: '',
        model: '',
        constructionType: 'электромагнитный',
        diameter: '',
        state: 'работает',
    });
    const [valveErrors, setValveErrors] = useState({
        manufacturer: '',
        model: '',
        constructionType: '',
        diameter: '',
        state: '',
    });
    const [serverError, setServerError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Загрузка данных при первом рендере страницы
    useEffect(() => {
        loadData();
    }, []);

    /**
     * Загружает список клапанов и теплиц с сервера.
     * В случае ошибки записывает диагностическое сообщение в консоль
     * и выставляет текст ошибки для отображения на странице.
     */
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [valvesData, greenhousesData] = await Promise.all([
                fetchValves(),
                fetchGreenhouses(),
            ]);

            setValves(valvesData);
            setGreenhouses(greenhousesData);

            if (valvesData.length > 0) {
                setActiveValveId((prev) => {
                    const stillExists = valvesData.some((v) => v.id === prev);
                    return stillExists ? prev : valvesData[0].id;
                });
            } else {
                setActiveValveId(null);
            }
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Не удалось загрузить данные. Проверьте соединение с сервером.');
        } finally {
            setLoading(false);
        }
    };

    /** @type {Object|undefined} Активный клапан из списка. */
    const activeValve = valves.find((v) => v.id === activeValveId);

    /** @type {Array} Теплицы, привязанные к активному клапану. */
    const valveGreenhouses = greenhouses.filter(
        (g) => g.valves && g.valves.some((v) => v.id === activeValveId)
    );

    /** @type {Array} Теплицы, не привязанные ни к одному клапану. */
    const freeGreenhouses = greenhouses.filter(
        (g) => !g.valves || g.valves.length === 0
    );

    /**
     * Валидирует форму добавления теплицы (название и описание).
     * @returns {boolean} — true, если ошибок нет.
     */
    const validateGreenhouseForm = () => {
        const errors = { name: '', description: '' };

        if (addMode === 'new') {
            errors.name = validateString(
                newGreenhouseName,
                LIMITS.greenhouseName,
                { required: true, pattern: RE_ALLOWED }
            );

            if (!errors.name) {
                const nameLower = newGreenhouseName.trim().toLowerCase();
                if (
                    greenhouses.some(
                        (g) => g.name.trim().toLowerCase() === nameLower
                    )
                ) {
                    errors.name = 'Теплица с таким названием уже существует';
                }
            }

            errors.description = validateString(
                newGreenhouseDescription,
                LIMITS.greenhouseDescription,
                { required: false }
            );
        }

        setGreenhouseErrors(errors);
        return Object.values(errors).every((e) => !e);
    };

    /**
     * Валидирует форму создания клапана.
     * Проверяет производителя, модель (включая уникальность), тип конструкции,
     * диаметр и состояние.
     * @returns {boolean} — true, если ошибок нет.
     */
    const validateValveForm = () => {
        const errors = {
            manufacturer: validateString(
                valveForm.manufacturer,
                LIMITS.valveManufacturer,
                { required: true, pattern: RE_ALLOWED }
            ),
            model: validateString(
                valveForm.model,
                LIMITS.valveModel,
                { required: true, pattern: RE_ALLOWED }
            ),
            constructionType: CONSTRUCTION_TYPES.some(
                (t) => t.value === valveForm.constructionType
            )
                ? ''
                : 'Выберите тип конструкции',
            diameter:
                valveForm.diameter === ''
                    ? ''
                    : validateNumber(valveForm.diameter, LIMITS.valveDiameter, {
                        required: false,
                    }),
            state: VALVE_STATES.some((s) => s.value === valveForm.state)
                ? ''
                : 'Выберите состояние',
        };

        if (!errors.model) {
            const modelLower = valveForm.model.trim().toLowerCase();
            if (valves.some((v) => v.model?.toLowerCase() === modelLower)) {
                errors.model = 'Клапан с такой моделью уже существует';
            }
        }

        setValveErrors(errors);
        return Object.values(errors).every((e) => !e);
    };

    /** Открывает модалку добавления теплицы и сбрасывает её поля. */
    const openAddModal = () => {
        setAddMode(freeGreenhouses.length > 0 ? 'existing' : 'new');
        setSelectedFreeId(freeGreenhouses[0]?.id?.toString() || '');
        setNewGreenhouseName('');
        setNewGreenhouseDescription('');
        setGreenhouseErrors({ name: '', description: '' });
        setIsAddModalOpen(true);
    };

    /** Закрывает модалку добавления теплицы без сохранения. */
    const cancelAddModal = () => {
        setIsAddModalOpen(false);
        setGreenhouseErrors({ name: '', description: '' });
    };

    /**
     * Подтверждает привязку теплицы к активному клапану.
     * В зависимости от addMode привязывает существующую теплицу
     * или создаёт новую. При успехе перезагружает данные.
     */
    const confirmAddModal = async () => {
        if (!validateGreenhouseForm()) return;

        setIsSubmitting(true);
        try {
            if (addMode === 'existing') {
                const id = parseInt(selectedFreeId, 10);
                if (!id) {
                    alert('Выберите теплицу из списка.');
                    setIsSubmitting(false);
                    return;
                }
                await linkGreenhouseToValve(activeValveId, { blockId: id });
            } else {
                await linkGreenhouseToValve(activeValveId, {
                    name: newGreenhouseName.trim(),
                    description: newGreenhouseDescription.trim() || undefined,
                });
            }

            await loadData();
            setIsAddModalOpen(false);
        } catch (err) {
            console.error('Ошибка при добавлении:', err);
            alert(
                err.response?.data?.message || 'Ошибка при привязке теплицы'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Запрашивает подтверждение отвязки теплицы от клапана. */
    const askRemoveGreenhouse = (id) => setGreenhouseToRemove(id);

    /** Отменяет отвязку теплицы. */
    const cancelRemoveGreenhouse = () => setGreenhouseToRemove(null);

    /**
     * Подтверждает отвязку теплицы от клапана.
     * При успехе перезагружает данные и закрывает модалку.
     */
    const confirmRemoveGreenhouse = async () => {
        setIsSubmitting(true);
        try {
            await unlinkGreenhouseFromValve(activeValveId, greenhouseToRemove);
            await loadData();
            setGreenhouseToRemove(null);
        } catch (err) {
            console.error('Ошибка при отвязке:', err);
            alert(err.response?.data?.message || 'Ошибка при отвязке теплицы');
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Открывает модалку создания нового клапана и сбрасывает её поля. */
    const openValveModal = () => {
        setValveForm({
            manufacturer: '',
            model: '',
            constructionType: 'электромагнитный',
            diameter: '',
            state: 'работает',
        });
        setValveErrors({
            manufacturer: '',
            model: '',
            constructionType: '',
            diameter: '',
            state: '',
        });
        setServerError('');
        setIsValveModalOpen(true);
    };

    /** Закрывает модалку создания клапана без сохранения. */
    const cancelValveModal = () => {
        setIsValveModalOpen(false);
        setServerError('');
    };

    /**
     * Обновляет поле формы клапана и сбрасывает ошибку этого поля.
     * @param {string} field — имя поля.
     * @param {string} value — новое значение.
     */
    const handleValveChange = (field, value) => {
        setValveForm((prev) => ({ ...prev, [field]: value }));
        if (valveErrors[field]) {
            setValveErrors((prev) => ({ ...prev, [field]: '' }));
        }
        if (serverError) setServerError('');
    };

    /**
     * Подтверждает создание клапана.
     * Валидирует форму, формирует payload, вызывает createValve.
     * При успехе перезагружает данные и делает созданный клапан активным.
     * При ошибке API показывает сообщение в модалке.
     */
    const confirmValveModal = async () => {
        if (!validateValveForm()) return;

        setIsSubmitting(true);
        setServerError('');
        try {
            const payload = {
                manufacturer: valveForm.manufacturer.trim(),
                model: valveForm.model.trim(),
                constructionType: valveForm.constructionType,
                state: valveForm.state,
            };
            if (valveForm.diameter !== '') {
                payload.diameter = Number(valveForm.diameter);
            }

            const created = await createValve(payload);
            await loadData();
            if (created?.id) setActiveValveId(created.id);
            setIsValveModalOpen(false);
        } catch (err) {
            console.error('Ошибка при создании клапана:', err);
            setServerError(
                err.response?.data?.message ||
                err.message ||
                'Не удалось создать клапан'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="valves-loading">Загрузка данных...</div>;
    if (error) return <div className="valves-error">{error}</div>;

    return (
        <div className="valves-page">
            {/* ... JSX остаётся без изменений ... */}
        </div>
    );
};

export default ValvesPage;