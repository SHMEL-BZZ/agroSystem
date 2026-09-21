import React, { useState } from 'react';
import './WateringPage.css';

const WateringPage = () => {
    const [step, setStep] = useState('setup');
    // Период, который пользователь собирается удалить (null — модалка закрыта)
    const [periodToDelete, setPeriodToDelete] = useState(null);
    const [activePeriodId, setActivePeriodId] = useState(1);

    // Объём бака для полива (в литрах)
    const [tankVolume, setTankVolume] = useState(2000);

    // Модалка настройки объёма бака
    const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
    const [volumeDraft, setVolumeDraft] = useState('2000');

    // Баки с готовыми растворами (заглушка)
    const [sourceTanks] = useState([
        { id: 1, name: 'Бак 1' },
        { id: 2, name: 'Бак 2' },
        { id: 3, name: 'Бак 3' },
    ]);

    const [mixVolumes, setMixVolumes] = useState({});

    const updateMixVolume = (periodId, tankId, value) => {
        setMixVolumes((prev) => ({
            ...prev,
            [periodId]: {
                ...(prev[periodId] || {}),
                [tankId]: value,
            },
        }));
    };

    // Дата
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState(today);
    const isEditable = selectedDate >= today;
    const isPast = selectedDate < today;

    // Периоды полива
    // По умолчанию два периода: утро и середина дня
    const [periods, setPeriods] = useState([
        { id: 1, name: 'Период 1', start: '', duration: '', volume: '' },
        { id: 2, name: 'Период 2', start: '', duration: '', volume: '' },
    ]);

    const addPeriod = () => {
        const newId = periods.length
            ? Math.max(...periods.map((p) => p.id)) + 1
            : 1;
        const newName = `Период ${periods.length + 1}`;
        setPeriods([
            ...periods,
            { id: newId, name: newName, start: '', duration: '', volume: '' },
        ]);
    };

    const updatePeriod = (id, field, value) => {
        setPeriods((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    // Объём выбранного периода
    const activePeriod = periods.find((p) => p.id === activePeriodId);
    const activePeriodVolume = parseFloat(activePeriod?.volume) || 0;

    const handleSave = () => {
        console.log('Сохранено:', {
            date: selectedDate,
            periods,
            mixVolumes,
        });
        setStep('setup');
    };

    const openVolumeModal = () => {
        setVolumeDraft(String(tankVolume));
        setIsVolumeModalOpen(true);
    };

    const cancelVolumeModal = () => {
        setIsVolumeModalOpen(false);
    };

    const confirmVolumeModal = () => {
        const val = parseFloat(volumeDraft);
        if (!val || val <= 0) {
            alert('Введите корректный объём бака (больше 0).');
            return;
        }
        setTankVolume(val);
        setIsVolumeModalOpen(false);
    };

    const WarningBanner = ({ children }) => (
        <div className="warning-banner">
            <span className="warning-banner__icon">⚠</span>
            <span className="warning-banner__text">{children}</span>
        </div>
    );

    // Открыть модалку подтверждения
    const askDeletePeriod = (id) => {
        setPeriodToDelete(id);
    };

    // Отмена
    const cancelDelete = () => {
        setPeriodToDelete(null);
    };

    // Подтверждение удаления
    const confirmDelete = () => {
        setPeriods((prev) => {
            // Убираем период с нужным id
            const filtered = prev.filter((p) => p.id !== periodToDelete);

            // Перенумеровываем оставшиеся
            const renumbered = filtered.map((p, i) => ({
                ...p,
                name: `Период ${i + 1}`,
            }));

            return renumbered;
        });

        // Если удалили активный период — переключаемся на первый оставшийся
        setActivePeriodId((currentId) => {
            if (currentId === periodToDelete) return 1;
            return currentId;
        });

        // Чистим mixVolumes от удалённого периода
        setMixVolumes((prev) => {
            const copy = { ...prev };
            delete copy[periodToDelete];
            return copy;
        });

        setPeriodToDelete(null);
    };


    // Таблица периодов
    if (step === 'setup') {
        return (
            <div className="watering-page">
                {periodToDelete !== null && (
                    <div className="confirm-overlay" onClick={cancelDelete}>
                        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="confirm-modal__icon">⚠</div>
                            <h3 className="confirm-modal__title">Удалить период?</h3>
                            <p className="confirm-modal__text">
                                Период «{
                                    periods.find((p) => p.id === periodToDelete)?.name
                                }» будет удалён вместе с введёнными данными.
                                Это действие нельзя отменить.
                            </p>
                            <div className="confirm-modal__actions">
                                <button
                                    type="button"
                                    className="watering-button watering-button--secondary"
                                    onClick={cancelDelete}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="watering-button watering-button--danger"
                                    onClick={confirmDelete}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="watering-card">
                    <h1 className="watering-title">Система полива</h1>

                    {/* Строка с датой */}
                    <div className="watering-date">
                        <span className="watering-date__label">Дата:</span>
                        <input
                            type="date"
                            className="watering-date__input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {isPast && (
                            <span className="watering-date__note">
                                Просмотр прошлых данных. Изменения недоступны.
                            </span>
                        )}
                        {selectedDate > today && (
                            <span className="watering-date__note watering-date__note--future">
                                Планирование на будущую дату. Изменения сохранятся.
                            </span>
                        )}
                    </div>

                    {/* Предупреждение, если периодов больше 3 */}
                    {periods.length > 3 && (
                        <WarningBanner>
                            Столько периодов полива может быть нецелесообразно.
                            Проверьте, нужны ли все.
                        </WarningBanner>
                    )}

                    {/* Таблица */}
                    <div className="watering-table-wrapper">
                        <table className="watering-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {periods.map((p, i) => (
                                        <th key={p.id}>
                                            <div className="watering-table__head">
                                                <span>{p.name}</span>
                                                {periods.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="watering-table__remove"
                                                        onClick={() => askDeletePeriod(p.id)}
                                                        title="Удалить период"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="watering-table__add-cell">
                                        <button
                                            type="button"
                                            className="watering-table__add"
                                            onClick={addPeriod}
                                            title="Добавить период"
                                        >
                                            +
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Время начала</td>
                                    {periods.map((p) => (
                                        <td key={p.id}>
                                            <input
                                                type="time"
                                                className="watering-table__input"
                                                value={p.start}
                                                disabled={!isEditable}
                                                onChange={(e) =>
                                                    updatePeriod(p.id, 'start', e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Длительность</td>
                                    {periods.map((p) => (
                                        <td key={p.id}>
                                            <input
                                                type="text"
                                                className="watering-table__input"
                                                placeholder="мин"
                                                value={p.duration}
                                                disabled={!isEditable}
                                                onChange={(e) =>
                                                    updatePeriod(p.id, 'duration', e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Объём</td>
                                    {periods.map((p) => (
                                        <td key={p.id}>
                                            <input
                                                type="number"
                                                className="watering-table__input"
                                                placeholder="л"
                                                value={p.volume}
                                                disabled={!isEditable}
                                                onChange={(e) =>
                                                    updatePeriod(p.id, 'volume', e.target.value)
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button
                        className="watering-button"
                        onClick={() => setStep('distribution')}
                        disabled={!isEditable}
                    >
                        Настройка полива
                    </button>

                    <p className="watering-tank-note">
                        Заданный объём бака для полива: <b>{tankVolume} л.</b>{' '}
                        Для изменения{' '}
                        <button
                            type="button"
                            className="watering-tank-note__link"
                            onClick={() => setStep('distribution')}
                        >
                            перейти в настройки полива
                        </button>
                        .
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="watering-page">
            <div className="watering-card">
                {/* Сверху — жёлтое предупреждение с общим объёмом */}
                <WarningBanner>
                    Заданный объём для «{activePeriod?.name}»: {activePeriodVolume} л.
                </WarningBanner>

                {/* Выбор периода */}
                <div className="period-selector">
                    <span className="period-selector__label">Период:</span>
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            className={
                                'period-selector__item' +
                                (p.id === activePeriodId ? ' period-selector__item--active' : '')
                            }
                            onClick={() => setActivePeriodId(p.id)}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                <div className="distribution">
                    {/* Левая колонка — бак */}
                    <div className="distribution__left">
                        <button
                            type="button"
                            className="distribution__settings"
                            onClick={openVolumeModal}
                            title="Настроить объём бака"
                            aria-label="Настроить объём бака"
                        >
                            ⚙
                        </button>

                        <div className="distribution__tank-view">
                            <img src="/bak.png" alt="Бак" className="distribution__tank-img" />
                        </div>
                    </div>

                    {isVolumeModalOpen && (
                        <div className="hint-modal-overlay" onClick={cancelVolumeModal}>
                            <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="hint-modal__close"
                                    onClick={cancelVolumeModal}
                                    aria-label="Закрыть"
                                >
                                    ×
                                </button>
                                <div className="hint-modal__icon">⚙</div>
                                <p className="hint-modal__text">
                                    Укажите объём бака для полива:
                                </p>
                                <div className="hint-modal__input-row">
                                    <input
                                        type="number"
                                        min="1"
                                        value={volumeDraft}
                                        onChange={(e) => setVolumeDraft(e.target.value)}
                                        className="hint-modal__input"
                                        autoFocus
                                    />
                                    <span>л.</span>
                                </div>
                                <div className="hint-modal__actions">
                                    <button
                                        type="button"
                                        className="hint-modal__btn hint-modal__btn--secondary"
                                        onClick={cancelVolumeModal}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        className="hint-modal__btn hint-modal__btn--primary"
                                        onClick={confirmVolumeModal}
                                    >
                                        Сохранить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Правая колонка — литры из баков с растворами */}
                    <div className="distribution__right">
                        <h2 className="distribution__title">Подготовка к поливу:</h2>

                        {sourceTanks.map((tank) => (
                            <div className="distribution__row" key={tank.id}>
                                <label className="distribution__label">{tank.name}</label>
                                <input
                                    type="number"
                                    className="distribution__input"
                                    value={mixVolumes[activePeriodId]?.[tank.id] || ''}
                                    onChange={(e) =>
                                        updateMixVolume(activePeriodId, tank.id, e.target.value)
                                    }
                                />
                                <span className="distribution__unit">л.</span>
                            </div>
                        ))}

                        <p className="distribution__note">
                            Растворы из этих баков смешиваются в баке для полива.
                        </p>
                    </div>
                </div>

                {/* Кнопки снизу */}
                <div className="distribution__actions">
                    <button
                        className="watering-button watering-button--secondary"
                        onClick={() => setStep('setup')}
                    >
                        Назад
                    </button>
                    <button
                        className="watering-button"
                        onClick={handleSave}
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WateringPage;