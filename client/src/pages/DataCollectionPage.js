import React, { useEffect, useState } from 'react';
import './DataCollectionPage.css';

const DataCollectionPage = () => {
    const today = new Date().toISOString().slice(0, 10);

    const [devicesSeason, setDevicesSeason] = useState('');
    const [devicesLastGen, setDevicesLastGen] = useState('');
    const [devicesGenerated, setDevicesGenerated] = useState(false);

    const [drainageLastGen, setDrainageLastGen] = useState('');
    const [drainageGenerated, setDrainageGenerated] = useState(false);

    const [timeToMidnight, setTimeToMidnight] = useState('');

    useEffect(() => {
        const dGen = localStorage.getItem('dataCollection:devices:lastGen') || '';
        const rGen = localStorage.getItem('dataCollection:drainage:lastGen') || '';

        setDevicesLastGen(dGen);
        setDrainageLastGen(rGen);

        setDevicesGenerated(dGen === today);
        setDrainageGenerated(rGen === today);
    }, [today]);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = Math.max(0, midnight - now);

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            setTimeToMidnight(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            );
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const canGenerateDevices = devicesSeason !== '' && !devicesGenerated;

    const handleGenerateDevices = () => {
        if (!canGenerateDevices) return;

        // TODO: здесь будет вызов Python-скрипта через API
        console.log('Генерация данных с приборов, сезон:', devicesSeason);

        localStorage.setItem('dataCollection:devices:lastGen', today);
        setDevicesLastGen(today);
        setDevicesGenerated(true);
    };

    const canGenerateDrainage = !drainageGenerated;

    const handleGenerateDrainage = () => {
        if (!canGenerateDrainage) return;

        // TODO: здесь будет вызов Python-скрипта через API
        console.log('Генерация данных дренажа');

        localStorage.setItem('dataCollection:drainage:lastGen', today);
        setDrainageLastGen(today);
        setDrainageGenerated(true);
    };

    return (
        <div className="data-page">
            <section className="data-card">
                <h2 className="data-card__title">Данные с приборов</h2>

                <div className="data-card__controls">
                    <label className="data-card__label">
                        Сезон:
                        <select
                            className="data-card__select"
                            value={devicesSeason}
                            onChange={(e) => setDevicesSeason(e.target.value)}
                            disabled={devicesGenerated}
                        >
                            <option value="">— выберите сезон —</option>
                            <option value="summer">Лето</option>
                            <option value="offseason">Осень / Весна</option>
                        </select>
                    </label>

                    <button
                        type="button"
                        className="data-card__button"
                        onClick={handleGenerateDevices}
                        disabled={!canGenerateDevices}
                        title={
                            devicesGenerated
                                ? 'Данные за сегодня уже сгенерированы'
                                : devicesSeason === ''
                                    ? 'Сначала выберите сезон'
                                    : 'Сгенерировать данные'
                        }
                    >
                        Генерация
                    </button>
                </div>

                {!devicesGenerated ? (
                    <div className="data-hint data-hint--info">
                        Данные генерируются <b>один раз в день</b>. Повторная
                        генерация станет доступна завтра.
                    </div>
                ) : (
                    <div className="data-hint data-hint--warning">
                        Данные за <b>{devicesLastGen}</b> уже сгенерированы.
                        Следующая генерация будет доступна через{' '}
                        <b>{timeToMidnight}</b>.
                    </div>
                )}

                <div className="data-output">
                    {devicesGenerated
                        ? 'Здесь будут отображены сгенерированные данные с приборов.'
                        : 'Пока ничего не сгенерировано. Выберите сезон и нажмите «Генерация».'}
                </div>
            </section>

            <section className="data-card">
                <h2 className="data-card__title">Дренаж</h2>

                <div className="data-card__controls">
                    <button
                        type="button"
                        className="data-card__button"
                        onClick={handleGenerateDrainage}
                        disabled={!canGenerateDrainage}
                        title={
                            drainageGenerated
                                ? 'Данные за сегодня уже сгенерированы'
                                : 'Сгенерировать данные'
                        }
                    >
                        Генерация
                    </button>
                </div>

                {!drainageGenerated ? (
                    <div className="data-hint data-hint--info">
                        Данные генерируются <b>один раз в день</b>. Повторная
                        генерация станет доступна завтра.
                    </div>
                ) : (
                    <div className="data-hint data-hint--warning">
                        Данные за <b>{drainageLastGen}</b> уже сгенерированы.
                        Следующая генерация будет доступна через{' '}
                        <b>{timeToMidnight}</b>.
                    </div>
                )}

                <div className="data-output">
                    {drainageGenerated
                        ? 'Здесь будут отображены сгенерированные данные дренажа.'
                        : 'Пока ничего не сгенерировано. Нажмите «Генерация».'}
                </div>
            </section>
        </div>
    );
};

export default DataCollectionPage;