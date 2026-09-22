import React, { useState } from 'react';
import './WateringPage.css';

const WateringPage = () => {
    const [step, setStep] = useState('setup');
    // Период, который пользователь собирается удалить (null — модалка закрыта)
    const [periodToDelete, setPeriodToDelete] = useState(null);
    const [activePeriodId, setActivePeriodId] = useState(1);

    // Объём бака для полива (в литрах) — из шестерёнки
    const [tankVolume, setTankVolume] = useState(2000);

    // Модалка настройки объёма бака
    const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
    const [volumeDraft, setVolumeDraft] = useState('2000');

    // Баки с готовыми растворами (заглушка)
    const [sourceTanks] = useState([
        {
            id: 1,
            name: 'Бак 1',
            volume: 2000,
            usedLiters: 100,
            items: [
                { kind: 'water', name: 'Вода', amount: 100, unit: 'л' },
                { kind: 'additive', name: 'Нитрат аммония', amount: 150, unit: 'г' },
            ],
        },
        {
            id: 2,
            name: 'Бак 2',
            volume: 2000,
            usedLiters: 80,
            items: [
                { kind: 'water', name: 'Вода', amount: 80, unit: 'л' },
                { kind: 'additive', name: 'Монофосфат калия', amount: 60, unit: 'г' },
            ],
        },
        {
            id: 3,
            name: 'Бак 3',
            volume: 2000,
            usedLiters: 50,
            items: [
                { kind: 'water', name: 'Вода', amount: 50, unit: 'л' },
                { kind: 'additive', name: 'Гуминовые кислоты', amount: 100, unit: 'мл' },
            ],
        },
    ]);

    const MAX_TANKS = sourceTanks.length;

    // Строки баков по периодам
    // { [periodId]: [{ tankId: '', volume: '' }, ...] }
    const [tankRowsByPeriod, setTankRowsByPeriod] = useState({});

    // Периоды
    // По умолчанию два периода: утро и середина дня
    const [periods, setPeriods] = useState([
        { id: 1, name: 'Период 1', start: '', duration: '', volume: '' },
        { id: 2, name: 'Период 2', start: '', duration: '', volume: '' },
    ]);

    // Дата
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDate, setSelectedDate] = useState(today);
    const isEditable = selectedDate >= today;
    const isPast = selectedDate < today;

    // Активный период
    const activePeriod = periods.find((p) => p.id === activePeriodId);
    // Объём, заданный в таблице для активного периода
    const activePeriodVolume = parseFloat(activePeriod?.volume) || 0;
    // Строки распределения по бакам для активного периода
    const activeRows = tankRowsByPeriod[activePeriodId] || [];
    // Сумма литров по бакам активного периода
    const totalMixVolume = activeRows.reduce((sum, r) => {
        const v = parseFloat(r.volume);
        return sum + (isNaN(v) ? 0 : v);
    }, 0);

    // Превышение: взяли из баков больше, чем задано в таблице
    const exceedsPeriodVolume = totalMixVolume > activePeriodVolume;
    const overflow = Math.max(0, totalMixVolume - activePeriodVolume);

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
        // Обрезка объёма периода по объёму бака (нельзя вылить больше, чем влезает)
        if (field === 'volume') {
            const num = parseFloat(value);
            if (!isNaN(num) && num > tankVolume) {
                value = String(tankVolume);
            }
            if (!isNaN(num) && num < 0) {
                value = '0';
            }
        }
        setPeriods((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleSave = () => {
        // Проверка по всем периодам: сумма по бакам не больше объёма периода
        for (const p of periods) {
            const rows = tankRowsByPeriod[p.id] || [];
            const sum = rows.reduce((s, r) => {
                const v = parseFloat(r.volume);
                return s + (isNaN(v) ? 0 : v);
            }, 0);
            const limit = parseFloat(p.volume) || 0;
            if (sum > limit) {
                alert(
                    `Период «${p.name}»: сумма по бакам (${sum.toFixed(2)} л) `
                    + `превышает заданный объём периода (${limit.toFixed(2)} л). `
                    + `Уменьшите объёмы.`
                );
                return;
            }
        }

        console.log('Сохранено:', {
            date: selectedDate,
            periods: periods.map((p) => ({
                ...p,
                volume: parseFloat(p.volume) || 0,
            })),
            tankRowsByPeriod,
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

    // Открыть модалку подтверждения удаления периода
    const askDeletePeriod = (id) => {
        setPeriodToDelete(id);
    };

    // Отмена удаления
    const cancelDelete = () => {
        setPeriodToDelete(null);
    };

    // Подтверждение удаления
    const confirmDelete = () => {
        setPeriods((prev) => {
            const filtered = prev.filter((p) => p.id !== periodToDelete);
            return filtered.map((p, i) => ({ ...p, name: `Период ${i + 1}` }));
        });

        setActivePeriodId((currentId) =>
            currentId === periodToDelete ? 1 : currentId
        );

        setTankRowsByPeriod((prev) => {
            const copy = { ...prev };
            delete copy[periodToDelete];
            return copy;
        });

        setPeriodToDelete(null);
    };

    // Работа с количеством баков
    const handleTanksCountChange = (periodId, value) => {
        if (value === '') {
            setTankRowsByPeriod((prev) => ({ ...prev, [periodId]: [] }));
            return;
        }
        let num = parseInt(value, 10);
        if (isNaN(num)) return;
        if (num < 0) num = 0;
        if (num > MAX_TANKS) num = MAX_TANKS;

        setTankRowsByPeriod((prev) => {
            const current = prev[periodId] || [];
            const next = current.slice(0, num);
            while (next.length < num) {
                next.push({ tankId: '', volume: '' });
            }
            return { ...prev, [periodId]: next };
        });
    };

    // Изменение строки бака
    const updateTankRow = (periodId, index, field, value) => {
        // Жёсткая обрезка поля объёма по объёму бака
        if (field === 'volume') {
            const num = parseFloat(value);
            if (!isNaN(num) && num > tankVolume) {
                value = String(tankVolume);
            }
            if (!isNaN(num) && num < 0) {
                value = '0';
            }
        }

        setTankRowsByPeriod((prev) => {
            const rows = (prev[periodId] || []).map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            );
            return { ...prev, [periodId]: rows };
        });
    };

    // ─── Шаг 1: таблица периодов ────────────────────────────
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
                                    {periods.map((p) => (
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
                                                min="0"
                                                max={tankVolume}
                                                step="0.01"
                                                className="watering-table__input"
                                                placeholder={`до ${tankVolume}`}
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

    // ─── Шаг 2: распределение по бакам ──────────────────────
    return (
        <div className="watering-page">
            <div className="watering-card">
                {/* Сверху — жёлтое предупреждение с объёмами */}
                <WarningBanner>
                    Объём периода «{activePeriod?.name}»: {activePeriodVolume} л
                    {' · '}распределено: {totalMixVolume.toFixed(2)} л
                    {' · '}объём бака: {tankVolume} л
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

                    {/* Правая колонка — распределение */}
                    <div className="distribution__right">
                        <h2 className="distribution__title">Подготовка к поливу:</h2>

                        {/* Сколько баков будет задействовано */}
                        <div className="distribution__row">
                            <label className="distribution__label distribution__label--long">
                                Сколько баков будет задействовано?
                            </label>
                            <input
                                type="number"
                                min="0"
                                max={MAX_TANKS}
                                className="distribution__input distribution__input--count"
                                value={activeRows.length || ''}
                                placeholder={`0–${MAX_TANKS}`}
                                onChange={(e) =>
                                    handleTanksCountChange(activePeriodId, e.target.value)
                                }
                            />
                            <span className="distribution__unit">шт.</span>
                        </div>

                        {/* Строки с выпадающими списками */}
                        {activeRows.length > 0 && (
                            <div className="distribution__tanks">
                                {activeRows.map((row, index) => {
                                    const selectedTankId = row.tankId ? Number(row.tankId) : null;
                                    const selectedTank = sourceTanks.find(
                                        (t) => t.id === selectedTankId
                                    );

                                    // Баки, выбранные в других строках этого периода
                                    const usedElsewhere = activeRows
                                        .map((r, i) => (i === index ? null : r.tankId))
                                        .filter(Boolean)
                                        .map(Number);

                                    // Доступные опции: все, кроме выбранных в других строках
                                    const availableTanks = sourceTanks.filter(
                                        (t) => !usedElsewhere.includes(t.id)
                                    );

                                    return (
                                        <div className="distribution__tank-row" key={index}>
                                            <select
                                                className="distribution__select"
                                                value={row.tankId}
                                                onChange={(e) =>
                                                    updateTankRow(
                                                        activePeriodId,
                                                        index,
                                                        'tankId',
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">— выберите бак —</option>
                                                {availableTanks.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="distribution__tank-contents">
                                                {selectedTank
                                                    ? (selectedTank.items || [])
                                                        .map(
                                                            (it) =>
                                                                `${it.name} — ${it.amount} ${it.unit}`
                                                        )
                                                        .join('; ') || 'пусто'
                                                    : '—'}
                                            </div>

                                            <input
                                                type="number"
                                                min="0"
                                                max={tankVolume}
                                                step="0.01"
                                                className="distribution__input"
                                                placeholder={`до ${tankVolume}`}
                                                value={row.volume}
                                                onChange={(e) =>
                                                    updateTankRow(
                                                        activePeriodId,
                                                        index,
                                                        'volume',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <span className="distribution__unit">л.</span>
                                        </div>
                                    );
                                })}

                                <div className="distribution__total">
                                    Итого: <b>{totalMixVolume.toFixed(2)} л</b>
                                    {' из '}
                                    <b>{activePeriodVolume} л</b>
                                </div>

                                {exceedsPeriodVolume && (
                                    <div className="distribution__warning">
                                        <b>⚠ Превышен объём периода.</b> Задано{' '}
                                        <b>{activePeriodVolume} л</b>, а распределено{' '}
                                        <b>{totalMixVolume.toFixed(2)} л</b>. Уменьшите объёмы
                                        на <b>{overflow.toFixed(2)} л</b>.
                                    </div>
                                )}
                            </div>
                        )}

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
                        disabled={exceedsPeriodVolume}
                        title={
                            exceedsPeriodVolume
                                ? 'Превышен объём периода'
                                : 'Сохранить настройки'
                        }
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WateringPage;