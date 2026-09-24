import React, { useState } from 'react';
import './ValvesPage.css';

const ValvesPage = () => {
    // Список клапанов — заглушка
    const [valves, setValves] = useState([
        { id: 1, name: 'Клапан 1' },
        { id: 2, name: 'Клапан 2' },
        { id: 3, name: 'Клапан 3' },
    ]);

    // Список теплиц с привязкой к клапанам — заглушка
    // valveId: null означает «свободная теплица»
    const [greenhouses, setGreenhouses] = useState([
        { id: 1, name: 'Теплица 1', valveId: 1 },
        { id: 2, name: 'Теплица 2', valveId: 1 },
        { id: 3, name: 'Теплица 3', valveId: 2 },
        { id: 4, name: 'Теплица 4', valveId: 3 },
        { id: 5, name: 'Теплица 5', valveId: null },
        { id: 6, name: 'Теплица 6', valveId: null },
    ]);

    // Активный клапан — по умолчанию первый
    const [activeValveId, setActiveValveId] = useState(valves[0]?.id || null);

    // Модалка добавления теплицы
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState('existing'); // 'existing' | 'new'
    const [selectedFreeId, setSelectedFreeId] = useState('');
    const [newGreenhouseName, setNewGreenhouseName] = useState('');

    // Модалка удаления
    const [greenhouseToRemove, setGreenhouseToRemove] = useState(null);

    const activeValve = valves.find((v) => v.id === activeValveId);

    // Теплицы выбранного клапана
    const valveGreenhouses = greenhouses.filter(
        (g) => g.valveId === activeValveId
    );

    // Свободные теплицы
    const freeGreenhouses = greenhouses.filter((g) => g.valveId === null);

    // ─── Модалка добавления ───
    const openAddModal = () => {
        setAddMode(freeGreenhouses.length > 0 ? 'existing' : 'new');
        setSelectedFreeId(freeGreenhouses[0]?.id?.toString() || '');
        setNewGreenhouseName('');
        setIsAddModalOpen(true);
    };

    const cancelAddModal = () => {
        setIsAddModalOpen(false);
    };

    const confirmAddModal = () => {
        if (addMode === 'existing') {
            const id = parseInt(selectedFreeId, 10);
            if (!id) {
                alert('Выберите теплицу из списка.');
                return;
            }
            setGreenhouses((prev) =>
                prev.map((g) =>
                    g.id === id ? { ...g, valveId: activeValveId } : g
                )
            );
        } else {
            const name = newGreenhouseName.trim();
            if (!name) {
                alert('Введите название теплицы.');
                return;
            }
            const newId = greenhouses.length
                ? Math.max(...greenhouses.map((g) => g.id)) + 1
                : 1;
            setGreenhouses((prev) => [
                ...prev,
                { id: newId, name, valveId: activeValveId },
            ]);
        }
        setIsAddModalOpen(false);
    };

    // ─── Модалка удаления ───
    const askRemoveGreenhouse = (id) => setGreenhouseToRemove(id);
    const cancelRemoveGreenhouse = () => setGreenhouseToRemove(null);
    const confirmRemoveGreenhouse = () => {
        setGreenhouses((prev) =>
            prev.map((g) =>
                g.id === greenhouseToRemove ? { ...g, valveId: null } : g
            )
        );
        setGreenhouseToRemove(null);
    };

    return (
        <div className="valves-page">
            {/* Левая панель — список клапанов */}
            <aside className="valves-sidebar">
                {valves.map((valve) => (
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
                        {valve.name}
                    </button>
                ))}
            </aside>

            {/* Правая часть */}
            <main className="valves-content">
                <div className="valves-header">
                    <h2 className="valves-title">
                        {activeValve ? activeValve.name : 'Клапан'}
                    </h2>
                    <button
                        type="button"
                        className="valves-add-btn"
                        onClick={openAddModal}
                        title="Добавить теплицу"
                    >
                        + Добавить теплицу
                    </button>
                </div>

                {valveGreenhouses.length === 0 ? (
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

            {/* Модалка добавления теплицы */}
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
                        >
                            ×
                        </button>

                        <h3 className="valves-modal__title">
                            Добавить теплицу
                        </h3>

                        {/* Переключатель режима */}
                        <div className="valves-modal__tabs">
                            <button
                                type="button"
                                className={
                                    'valves-modal__tab' +
                                    (addMode === 'existing'
                                        ? ' valves-modal__tab--active'
                                        : '')
                                }
                                onClick={() => setAddMode('existing')}
                                disabled={freeGreenhouses.length === 0}
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
                                onClick={() => setAddMode('new')}
                            >
                                Новая теплица
                            </button>
                        </div>

                        {/* Режим: свободная теплица */}
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

                        {/* Режим: новая теплица */}
                        {addMode === 'new' && (
                            <div className="valves-modal__body">
                                <label className="valves-modal__label">
                                    Название теплицы:
                                </label>
                                <input
                                    type="text"
                                    className="valves-modal__input"
                                    placeholder="Например, Теплица 3"
                                    value={newGreenhouseName}
                                    onChange={(e) =>
                                        setNewGreenhouseName(e.target.value)
                                    }
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="valves-modal__actions">
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--secondary"
                                onClick={cancelAddModal}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--primary"
                                onClick={confirmAddModal}
                            >
                                Добавить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка удаления теплицы */}
            {greenhouseToRemove !== null && (
                <div className="valves-overlay" onClick={cancelRemoveGreenhouse}>
                    <div
                        className="valves-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="valves-modal__close"
                            onClick={cancelRemoveGreenhouse}
                            aria-label="Закрыть"
                        >
                            ×
                        </button>
                        <div className="valves-modal__icon">⚠</div>
                        <h3 className="valves-modal__title">
                            Убрать теплицу из клапана?
                        </h3>
                        <p className="valves-modal__text">
                            Теплица «
                            {greenhouses.find((g) => g.id === greenhouseToRemove)?.name}
                            » будет отвязана от клапана. Её можно будет привязать
                            к другому клапану позже.
                        </p>
                        <div className="valves-modal__actions">
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--secondary"
                                onClick={cancelRemoveGreenhouse}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="valves-modal__btn valves-modal__btn--danger"
                                onClick={confirmRemoveGreenhouse}
                            >
                                Убрать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValvesPage;