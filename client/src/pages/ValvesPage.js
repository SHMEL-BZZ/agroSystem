import React, { useState, useEffect } from 'react';
import './ValvesPage.css';
import {
    fetchValves,
    linkGreenhouseToValve,
    unlinkGreenhouseFromValve,
    createValve,
} from '../http/valveAPI';
import { fetchGreenhouses } from '../http/greenhouseAPI';

const LIMITS = {
    valveManufacturer: { min: 2, max: 50, label: 'Производитель' },
    valveModel: { min: 1, max: 50, label: 'Модель' },
    valveDiameter: { min: 0.01, max: 300, label: 'Диаметр' },
    greenhouseName: { min: 2, max: 100, label: 'Название теплицы' },
    greenhouseDescription: { min: 0, max: 500, label: 'Описание' },
};

const RE_ALLOWED = /^[а-яёa-z0-9\s.,\-_/'"()]+$/i;

function validateString(value, { min, max, label }, { required = false, pattern = null } = {}) {
    const v = (value ?? '').toString().trim();
    if (required && !v) return `${label} — обязательное поле`;
    if (!v) return '';
    if (min !== undefined && v.length < min) return `${label}: минимум ${min} символов`;
    if (max !== undefined && v.length > max) return `${label}: максимум ${max} символов`;
    if (pattern && !pattern.test(v)) return `${label}: недопустимые символы`;
    return '';
}

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

const CONSTRUCTION_TYPES = [
    { value: 'электромагнитный', label: 'Электромагнитный' },
    { value: 'шаровый', label: 'Шаровый' },
    { value: 'дисковый', label: 'Дисковый' },
    { value: 'игольчатый', label: 'Игольчатый' },
];

const VALVE_STATES = [
    { value: 'работает', label: 'Работает' },
    { value: 'отключен', label: 'Отключен' },
    { value: 'аварийное', label: 'Аварийное' },
];

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

    useEffect(() => {
        loadData();
    }, []);

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

    const activeValve = valves.find((v) => v.id === activeValveId);

    const valveGreenhouses = greenhouses.filter(
        (g) => g.valves && g.valves.some((v) => v.id === activeValveId)
    );

    const freeGreenhouses = greenhouses.filter(
        (g) => !g.valves || g.valves.length === 0
    );

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

    const openAddModal = () => {
        setAddMode(freeGreenhouses.length > 0 ? 'existing' : 'new');
        setSelectedFreeId(freeGreenhouses[0]?.id?.toString() || '');
        setNewGreenhouseName('');
        setNewGreenhouseDescription('');
        setGreenhouseErrors({ name: '', description: '' });
        setIsAddModalOpen(true);
    };

    const cancelAddModal = () => {
        setIsAddModalOpen(false);
        setGreenhouseErrors({ name: '', description: '' });
    };

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

    const askRemoveGreenhouse = (id) => setGreenhouseToRemove(id);
    const cancelRemoveGreenhouse = () => setGreenhouseToRemove(null);

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

    const cancelValveModal = () => {
        setIsValveModalOpen(false);
        setServerError('');
    };

    const handleValveChange = (field, value) => {
        setValveForm((prev) => ({ ...prev, [field]: value }));
        if (valveErrors[field]) {
            setValveErrors((prev) => ({ ...prev, [field]: '' }));
        }
        if (serverError) setServerError('');
    };

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
            <aside className="valves-sidebar">
                {valves.length === 0 ? (
                    <div className="valves-sidebar__empty">Нет клапанов</div>
                ) : (
                    valves.map((valve) => (
                        <button
                            key={valve.id}
                            className={
                                'valves-sidebar__item' +
                                (valve.id === activeValveId
                                    ? ' valves-sidebar__item--active'
                                    : '')
                            }
                            onClick={() => setActiveValveId(valve.id)}
                        >
                            {valve.model || `Клапан ${valve.id}`}
                        </button>
                    ))
                )}

                <button
                    type="button"
                    className="valves-sidebar__add"
                    onClick={openValveModal}
                >
                    + Новый клапан
                </button>
            </aside>

            <main className="valves-content">
                <div className="valves-header">
                    <h2 className="valves-title">
                        {activeValve
                            ? activeValve.model || `Клапан ${activeValve.id}`
                            : 'Выберите клапан'}
                    </h2>
                    <button
                        type="button"
                        className="valves-add-btn"
                        onClick={openAddModal}
                        disabled={!activeValveId}
                        title="Добавить теплицу"
                    >
                        + Добавить теплицу
                    </button>
                </div>

                {!activeValveId ? (
                    <div className="valves-empty">
                        Выберите клапан из списка слева или создайте новый.
                    </div>
                ) : valveGreenhouses.length === 0 ? (
                    <div className="valves-empty">
                        К этому клапану пока не привязано ни одной теплицы.
                    </div>
                ) : (
                    <div className="valves-list">
                        {valveGreenhouses.map((g) => (
                            <div key={g.id} className="valves-item">
                                <span className="valves-item__name">{g.name}</span>
                                <button
                                    type="button"
                                    className="valves-item__remove"
                                    onClick={() => askRemoveGreenhouse(g.id)}
                                    title="Убрать из клапана"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {isAddModalOpen && (
                <div className="valves-overlay" onClick={cancelAddModal}>
                    <div
                        className="valves-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="valves-modal__close"
                            onClick={cancelAddModal}
                            aria-label="Закрыть"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>

                        <h3 className="valves-modal__title">Добавить теплицу</h3>

                        <div className="valves-modal__tabs">
                            <button
                                type="button"
                                className={
                                    'valves-modal__tab' +
                                    (addMode === 'existing'
                                        ? ' valves-modal__tab--active'
                                        : '')
                                }
                                onClick={() => {
                                    setAddMode('existing');
                                    setGreenhouseErrors({ name: '', description: '' });
                                }}
                                disabled={
                                    freeGreenhouses.length === 0 || isSubmitting
                                }
                            >
                                Свободная теплица
                            </button>
                            <button
                                type="button"
                                className={
                                    'valves-modal__tab' +
                                    (addMode === 'new'
                                        ? ' valves-modal__tab--active'
                                        : '')
                                }
                                onClick={() => {
                                    setAddMode('new');
                                    setGreenhouseErrors({ name: '', description: '' });
                                }}
                                disabled={isSubmitting}
                            >
                                Новая теплица
                            </button>
                        </div>

                        {addMode === 'existing' && (
                            <div className="valves-modal__body">
                                {freeGreenhouses.length === 0 ? (
                                    <p className="valves-modal__note">
                                        Свободных теплиц нет. Выберите «Новая теплица».
                                    </p>
                                ) : (
                                    <>
                                        <label className="valves-modal__label">
                                            Выберите теплицу:
                                        </label>
                                        <select
                                            className="valves-modal__select"
                                            value={selectedFreeId}
                                            onChange={(e) =>
                                                setSelectedFreeId(e.target.value)
                                            }
                                            disabled={isSubmitting}
                                        >
                                            {freeGreenhouses.map((g) => (
                                                <option key={g.id} value={g.id}>
                                                    {g.name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                        )}

                        {addMode === 'new' && (
                            <div className="valves-modal__body">
                                <label className="valves-modal__label">
                                    Название теплицы *{' '}
                                    <span className="valves-modal__counter">
                                        {newGreenhouseName.length}/
                                        {LIMITS.greenhouseName.max}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className={
                                        'valves-modal__input' +
                                        (greenhouseErrors.name
                                            ? ' valves-modal__input--invalid'
                                            : '')
                                    }
                                    placeholder="Например, Теплица 3"
                                    value={newGreenhouseName}
                                    maxLength={LIMITS.greenhouseName.max}
                                    onChange={(e) => {
                                        setNewGreenhouseName(e.target.value);
                                        if (greenhouseErrors.name) {
                                            setGreenhouseErrors((p) => ({
                                                ...p,
                                                name: '',
                                            }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                                {greenhouseErrors.name && (
                                    <p className="valves-modal__error">
                                        {greenhouseErrors.name}
                                    </p>
                                )}

                                <label
                                    className="valves-modal__label"
                                    style={{ marginTop: '10px' }}
                                >
                                    Описание (необязательно){' '}
                                    <span className="valves-modal__counter">
                                        {newGreenhouseDescription.length}/
                                        {LIMITS.greenhouseDescription.max}
                                    </span>
                                </label>
                                <textarea
                                    className={
                                        'valves-modal__input' +
                                        (greenhouseErrors.description
                                            ? ' valves-modal__input--invalid'
                                            : '')
                                    }
                                    placeholder="Описание теплицы..."
                                    value={newGreenhouseDescription}
                                    maxLength={LIMITS.greenhouseDescription.max}
                                    onChange={(e) => {
                                        setNewGreenhouseDescription(e.target.value);
                                        if (greenhouseErrors.description) {
                                            setGreenhouseErrors((p) => ({
                                                ...p,
                                                description: '',
                                            }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    rows={3}
                                />
                                {greenhouseErrors.description && (
                                    <p className="valves-modal__error">
                                        {greenhouseErrors.description}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="valves-modal__actions">
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--secondary"
                                onClick={cancelAddModal}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--primary"
                                onClick={confirmAddModal}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Сохранение...' : 'Добавить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {greenhouseToRemove !== null && (
                <div
                    className="valves-overlay"
                    onClick={cancelRemoveGreenhouse}
                >
                    <div
                        className="valves-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="valves-modal__close"
                            onClick={cancelRemoveGreenhouse}
                            aria-label="Закрыть"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>
                        <div className="valves-modal__icon">⚠</div>
                        <h3 className="valves-modal__title">
                            Убрать теплицу из клапана?
                        </h3>
                        <p className="valves-modal__text">
                            Теплица «
                            {
                                greenhouses.find(
                                    (g) => g.id === greenhouseToRemove
                                )?.name
                            }
                            » будет отвязана от клапана. Её можно будет привязать
                            к другому клапану позже.
                        </p>
                        <div className="valves-modal__actions">
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--secondary"
                                onClick={cancelRemoveGreenhouse}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--danger"
                                onClick={confirmRemoveGreenhouse}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Удаление...' : 'Убрать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isValveModalOpen && (
                <div className="valves-overlay" onClick={cancelValveModal}>
                    <div
                        className="valves-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="valves-modal__close"
                            onClick={cancelValveModal}
                            aria-label="Закрыть"
                            disabled={isSubmitting}
                        >
                            ×
                        </button>

                        <h3 className="valves-modal__title">Новый клапан</h3>

                        <div className="valves-modal__body">
                            <label className="valves-modal__label">
                                Производитель *{' '}
                                <span className="valves-modal__counter">
                                    {valveForm.manufacturer.length}/
                                    {LIMITS.valveManufacturer.max}
                                </span>
                            </label>
                            <input
                                type="text"
                                className={
                                    'valves-modal__input' +
                                    (valveErrors.manufacturer
                                        ? ' valves-modal__input--invalid'
                                        : '')
                                }
                                placeholder="Например, Hunter"
                                value={valveForm.manufacturer}
                                maxLength={LIMITS.valveManufacturer.max}
                                onChange={(e) =>
                                    handleValveChange(
                                        'manufacturer',
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                                autoFocus
                            />
                            {valveErrors.manufacturer && (
                                <p className="valves-modal__error">
                                    {valveErrors.manufacturer}
                                </p>
                            )}

                            <label className="valves-modal__label">
                                Модель *{' '}
                                <span className="valves-modal__counter">
                                    {valveForm.model.length}/
                                    {LIMITS.valveModel.max}
                                </span>
                            </label>
                            <input
                                type="text"
                                className={
                                    'valves-modal__input' +
                                    (valveErrors.model
                                        ? ' valves-modal__input--invalid'
                                        : '')
                                }
                                placeholder="Например, PGV-301"
                                value={valveForm.model}
                                maxLength={LIMITS.valveModel.max}
                                onChange={(e) =>
                                    handleValveChange('model', e.target.value)
                                }
                                disabled={isSubmitting}
                            />
                            {valveErrors.model && (
                                <p className="valves-modal__error">
                                    {valveErrors.model}
                                </p>
                            )}

                            <label className="valves-modal__label">
                                Тип конструкции *
                            </label>
                            <select
                                className={
                                    'valves-modal__select' +
                                    (valveErrors.constructionType
                                        ? ' valves-modal__input--invalid'
                                        : '')
                                }
                                value={valveForm.constructionType}
                                onChange={(e) =>
                                    handleValveChange(
                                        'constructionType',
                                        e.target.value
                                    )
                                }
                                disabled={isSubmitting}
                            >
                                {CONSTRUCTION_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                            {valveErrors.constructionType && (
                                <p className="valves-modal__error">
                                    {valveErrors.constructionType}
                                </p>
                            )}

                            <label className="valves-modal__label">Диаметр, мм</label>
                            <input
                                type="number"
                                className={
                                    'valves-modal__input' +
                                    (valveErrors.diameter ? ' valves-modal__input--invalid' : '')
                                }
                                placeholder="Например, 25.40"
                                value={valveForm.diameter}
                                min={LIMITS.valveDiameter.min}
                                max={LIMITS.valveDiameter.max}
                                step="0.01"
                                onKeyDown={(e) => {
                                    const blocked = ['e', 'E', '+', '-'];
                                    if (blocked.includes(e.key)) e.preventDefault();
                                }}
                                onChange={(e) => handleValveChange('diameter', e.target.value)}
                                disabled={isSubmitting}
                            />
                            {valveErrors.diameter && (
                                <p className="valves-modal__error">{valveErrors.diameter}</p>
                            )}

                            <label className="valves-modal__label">
                                Состояние
                            </label>
                            <select
                                className="valves-modal__select"
                                value={valveForm.state}
                                onChange={(e) =>
                                    handleValveChange('state', e.target.value)
                                }
                                disabled={isSubmitting}
                            >
                                {VALVE_STATES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            {valveErrors.state && (
                                <p className="valves-modal__error">
                                    {valveErrors.state}
                                </p>
                            )}

                            {serverError && (
                                <p className="valves-modal__error">
                                    {serverError}
                                </p>
                            )}
                        </div>

                        <div className="valves-modal__actions">
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--secondary"
                                onClick={cancelValveModal}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--primary"
                                onClick={confirmValveModal}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Сохранение...' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValvesPage;