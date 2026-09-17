import React, { useState } from 'react';
import './WateringPage.css';

const WateringPage = () => {
    const [step, setStep] = useState('setup');

    const [activePeriodId, setActivePeriodId] = useState(1);

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
    const isToday = selectedDate === today;

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
        setPeriods([
            ...periods,
            { id: newId, name: `Период ${newId}`, start: '', duration: '', volume: '' },
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

    // Баки
    // Пока — заглушка: три бака. В будущем придут с сервера.
    const [tankVolume, setTankVolume] = useState('');

    const handleSave = () => {
        console.log('Сохранено:', {
            date: selectedDate,
            periods,
            mixVolumes,
        });
        setStep('setup');
    };

    const WarningBanner = ({ children }) => (
        <div className="warning-banner">
            <span className="warning-banner__icon">⚠</span>
            <span className="warning-banner__text">{children}</span>
        </div>
    );

    // Таблица периодов
    if (step === 'setup') {
        return (
            <div className="watering-page">
                <div className="watering-card">
                    <h1 className="watering-title">Система полива</h1>

                    {/* Строка с датой */}
                    <div className="watering-date">
                        <span className="watering-date__label">Дата:</span>
                        <input
                            type="date"
                            className="watering-date__input"
                            value={selectedDate}
                            max={today}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {!isToday && (
                            <span className="watering-date__note">
                                Просмотр прошлых данных. Изменения недоступны.
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
                                        <th key={p.id}>{p.name}</th>
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
                                                disabled={!isToday}
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
                                                disabled={!isToday}
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
                                                disabled={!isToday}
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
                        disabled={!isToday}
                    >
                        Настройка полива
                    </button>
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
                        <div className="distribution__tank-view">
                            <img
                                src="/bak.png"
                                alt="Бак"
                                className="distribution__tank-img"
                            />
                        </div>
                    </div>

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