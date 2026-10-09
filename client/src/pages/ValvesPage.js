import React, { useState, useEffect } from 'react';
import './ValvesPage.css';
import {
    fetchValves,
    linkGreenhouseToValve,
    unlinkGreenhouseFromValve,
    createValve,
} from '../http/valveAPI';
import { fetchGreenhouses } from '../http/greenhouseAPI';

const CONSTRUCTION_TYPES = [
    { value: 'электромагнитный', label: 'Электромагнитный' },
    { value: 'шаровый', label: 'Шаровый' },
    { value: 'дисковый', label: 'Дисковый' },
    { value: 'игольчатый', label: 'Игольчатый' },
];

const STATES = [
    { value: 'работает', label: 'Работает' },
    { value: 'отключен', label: 'Отключен' },
    { value: 'аварийное', label: 'Аварийное' },
];

const ValvesPage = () => {
    // ─── Список клапанов / теплиц ───
    const [valves, setValves] = useState([]);
    const [greenhouses, setGreenhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeValveId, setActiveValveId] = useState(null);

    // ─── Модалка «Добавить теплицу к клапану» ───
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState('existing');
    const [selectedFreeId, setSelectedFreeId] = useState('');
    const [newGreenhouseName, setNewGreenhouseName] = useState('');
    const [newGreenhouseDescription, setNewGreenhouseDescription] = useState('');
    const [nameError, setNameError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Модалка «Убрать теплицу» ───
    const [greenhouseToRemove, setGreenhouseToRemove] = useState(null);

    // ─── Модалка «Новый клапан» ───
    const [isValveModalOpen, setIsValveModalOpen] = useState(false);
    const [valveForm, setValveForm] = useState({
        manufacturer: '',
        model: '',
        constructionType: 'электромагнитный',
        diameter: '',
        state: 'работает',
    });
    const [valveFormError, setValveFormError] = useState('');

    // ─── Загрузка ───
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
            if (valvesData.length > 0 && !valvesData.some((v) => v.id === activeValveId)) {
                setActiveValveId(valvesData[0].id);
            }
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            setError('Не удалось загрузить данные. Проверьте соединение с сервером.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Фильтры ───
    const activeValve = valves.find((v) => v.id === activeValveId);

    const valveGreenhouses = greenhouses.filter(
        (g) => g.valves && g.valves.some((v) => v.id === activeValveId)
    );
    const freeGreenhouses = greenhouses.filter(
        (g) => !g.valves || g.valves.length === 0
    );

    const isNameTaken = (name, ignoreId = null) => {
        const normalized = name.trim().toLowerCase();
        if (!normalized) return false;
        return greenhouses.some(
            (g) =>
                g.id !== ignoreId &&
                g.name.trim().toLowerCase() === normalized
        );
    };

    // ─── Модалка «Добавить теплицу» ───
    const openAddModal = () => {
        setAddMode(freeGreenhouses.length > 0 ? 'existing' : 'new');
        setSelectedFreeId(freeGreenhouses[0]?.id?.toString() || '');
        setNewGreenhouseName('');
        setNewGreenhouseDescription('');
        setNameError('');
        setIsAddModalOpen(true);
    };
    const cancelAddModal = () => {
        setIsAddModalOpen(false);
        setNameError('');
    };
    const confirmAddModal = async () => {
        setIsSubmitting(true);
        setNameError('');
        try {
            if (addMode === 'existing') {
                const id = parseInt(selectedFreeId, 10);
                if (!id) {
                    alert('Выберите теплицу из списка.');
                    return;
                }
                await linkGreenhouseToValve(activeValveId, { blockId: id });
            } else {
                const name = newGreenhouseName.trim();
                if (!name) {
                    setNameError('Введите название теплицы.');
                    return;
                }
                if (isNameTaken(name)) {
                    setNameError('Теплица с таким названием уже существует.');
                    return;
                }
                await linkGreenhouseToValve(activeValveId, {
                    name,
                    description: newGreenhouseDescription,
                });
            }
            await loadData();
            setIsAddModalOpen(false);
        } catch (err) {
            console.error('Ошибка при добавлении:', err);
            alert(err.response?.data?.message || 'Ошибка при привязке теплицы');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Модалка «Убрать теплицу» ───
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

    // ─── Модалка «Новый клапан» ───
    const openValveModal = () => {
        setValveForm({
            manufacturer: '',
            model: '',
            constructionType: 'электромагнитный',
            diameter: '',
            state: 'работает',
        });
        setValveFormError('');
        setIsValveModalOpen(true);
    };
    const cancelValveModal = () => {
        setIsValveModalOpen(false);
        setValveFormError('');
    };
    const handleValveChange = (field, value) => {
        setValveForm((prev) => ({ ...prev, [field]: value }));
        if (valveFormError) setValveFormError('');
    };
    const confirmValveModal = async () => {
        setIsSubmitting(true);
        setValveFormError('');

        // Валидация на клиенте
        if (!valveForm.manufacturer.trim()) {
            setValveFormError('Укажите производителя.');
            setIsSubmitting(false);
            return;
        }
        if (!valveForm.model.trim()) {
            setValveFormError('Укажите модель.');
            setIsSubmitting(false);
            return;
        }

        // Проверка на дубликат модели (case-insensitive)
        const modelLower = valveForm.model.trim().toLowerCase();
        if (valves.some((v) => v.model?.toLowerCase() === modelLower)) {
            setValveFormError('Клапан с такой моделью уже существует.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                manufacturer: valveForm.manufacturer.trim(),
                model: valveForm.model.trim(),
                constructionType: valveForm.constructionType,
                state: valveForm.state,
            };
            if (valveForm.diameter !== '' && valveForm.diameter !== null) {
                payload.diameter = Number(valveForm.diameter);
            }

            const created = await createValve(payload);

            await loadData();
            // Сразу делаем новый клапан активным
            if (created?.id) {
                setActiveValveId(created.id);
            }
            setIsValveModalOpen(false);
        } catch (err) {
            console.error('Ошибка при создании клапана:', err);
            setValveFormError(
                err.response?.data?.message ||
                err.message ||
                'Не удалось создать клапан'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Рендер ───
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

                {/* Кнопка создания нового клапана */}
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

            {/* ─── Модалка «Добавить теплицу» (существующая) ─── */}
            {isAddModalOpen && (
                <div className="valves-overlay" onClick={cancelAddModal}>
                    <div className="valves-modal" onClick={(e) => e.stopPropagation()}>
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
                                    (addMode === 'existing' ? ' valves-modal__tab--active' : '')
                                }
                                onClick={() => { setAddMode('existing'); setNameError(''); }}
                                disabled={freeGreenhouses.length === 0 || isSubmitting}
                            >
                                Свободная теплица
                            </button>
                            <button
                                type="button"
                                className={
                                    'valves-modal__tab' +
                                    (addMode === 'new' ? ' valves-modal__tab--active' : '')
                                }
                                onClick={() => { setAddMode('new'); setNameError(''); }}
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
                                        <label className="valves-modal__label">Выберите теплицу:</label>
                                        <select
                                            className="valves-modal__select"
                                            value={selectedFreeId}
                                            onChange={(e) => setSelectedFreeId(e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            {freeGreenhouses.map((g) => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                        )}

                        {addMode === 'new' && (
                            <div className="valves-modal__body">
                                <label className="valves-modal__label">Название теплицы:</label>
                                <input
                                    type="text"
                                    className={
                                        'valves-modal__input' +
                                        (nameError ? ' valves-modal__input--invalid' : '')
                                    }
                                    placeholder="Например, Теплица 3"
                                    value={newGreenhouseName}
                                    onChange={(e) => {
                                        setNewGreenhouseName(e.target.value);
                                        if (nameError) setNameError('');
                                    }}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                                {nameError && <p className="valves-modal__error">{nameError}</p>}

                                <label className="valves-modal__label" style={{ marginTop: '10px' }}>
                                    Описание (необязательно):
                                </label>
                                <textarea
                                    className="valves-modal__input"
                                    placeholder="Описание теплицы..."
                                    value={newGreenhouseDescription}
                                    onChange={(e) => setNewGreenhouseDescription(e.target.value)}
                                    disabled={isSubmitting}
                                    rows={3}
                                />
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

            {/* ─── Модалка «Убрать теплицу» (существующая) ─── */}
            {greenhouseToRemove !== null && (
                <div className="valves-overlay" onClick={cancelRemoveGreenhouse}>
                    <div className="valves-modal" onClick={(e) => e.stopPropagation()}>
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
                        <h3 className="valves-modal__title">Убрать теплицу из клапана?</h3>
                        <p className="valves-modal__text">
                            Теплица «{greenhouses.find((g) => g.id === greenhouseToRemove)?.name}»
                            будет отвязана от клапана.
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

            {/* ─── НОВАЯ модалка «Новый клапан» ─── */}
            {isValveModalOpen && (
                <div className="valves-overlay" onClick={cancelValveModal}>
                    <div className="valves-modal" onClick={(e) => e.stopPropagation()}>
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
                            <label className="valves-modal__label">Производитель *</label>
                            <input
                                type="text"
                                className="valves-modal__input"
                                placeholder="Например, Hunter"
                                value={valveForm.manufacturer}
                                onChange={(e) => handleValveChange('manufacturer', e.target.value)}
                                disabled={isSubmitting}
                                autoFocus
                            />

                            <label className="valves-modal__label">Модель *</label>
                            <input
                                type="text"
                                className={
                                    'valves-modal__input' +
                                    (valveFormError ? ' valves-modal__input--invalid' : '')
                                }
                                placeholder="Например, PGV-301"
                                value={valveForm.model}
                                onChange={(e) => handleValveChange('model', e.target.value)}
                                disabled={isSubmitting}
                            />

                            <label className="valves-modal__label">Тип конструкции *</label>
                            <select
                                className="valves-modal__select"
                                value={valveForm.constructionType}
                                onChange={(e) => handleValveChange('constructionType', e.target.value)}
                                disabled={isSubmitting}
                            >
                                {CONSTRUCTION_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>

                            <label className="valves-modal__label">Диаметр, мм</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="valves-modal__input"
                                placeholder="Например, 25.40"
                                value={valveForm.diameter}
                                onChange={(e) => handleValveChange('diameter', e.target.value)}
                                disabled={isSubmitting}
                            />

                            <label className="valves-modal__label">Состояние</label>
                            <select
                                className="valves-modal__select"
                                value={valveForm.state}
                                onChange={(e) => handleValveChange('state', e.target.value)}
                                disabled={isSubmitting}
                            >
                                {STATES.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>

                            {valveFormError && (
                                <p className="valves-modal__error">{valveFormError}</p>
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