import React, { useEffect, useState } from 'react';
import './DataCollectionPage.css';
import { generatorsApi } from '../api/generatorsApi';

const DataCollectionPage = () => {
    const today = new Date().toISOString().slice(0, 10);

    const [devicesSeason, setDevicesSeason] = useState('');
    const [devicesLastGen, setDevicesLastGen] = useState('');
    const [devicesGenerated, setDevicesGenerated] = useState(false);
    const [devicesStatus, setDevicesStatus] = useState('idle');
    const [devicesData, setDevicesData] = useState([]);

    const [drainageLastGen, setDrainageLastGen] = useState('');
    const [drainageGenerated, setDrainageGenerated] = useState(false);
    const [drainageStatus, setDrainageStatus] = useState('idle');
    const [drainageData, setDrainageData] = useState([]);

    const [timeToMidnight, setTimeToMidnight] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // ─── localStorage: «последняя генерация» ─────────────────
    useEffect(() => {
        const dGen = localStorage.getItem('dataCollection:devices:lastGen') || '';
        const rGen = localStorage.getItem('dataCollection:drainage:lastGen') || '';

        setDevicesLastGen(dGen);
        setDrainageLastGen(rGen);

        setDevicesGenerated(dGen === today);
        setDrainageGenerated(rGen === today);

        if (dGen === today) loadDevicesData();
        if (rGen === today) loadDrainageData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [today]);

    // ─── Тикер до полуночи ───────────────────────────────────
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

    // ─── Загрузка данных из БД ───────────────────────────────
    const loadDevicesData = async () => {
        try {
            // Берём данные из генератора, который соответствует выбранному сезону
            // (если сезон не выбран, по умолчанию — summer)
            const name = devicesSeason === 'offseason' ? 'devices-offseason' : 'devices-summer';
            const rows = await generatorsApi.data(name, today);
            setDevicesData(Array.isArray(rows) ? rows : []);
        } catch (e) {
            console.error('Не удалось загрузить данные приборов:', e);
            setDevicesData([]);
        }
    };

    const loadDrainageData = async () => {
        try {
            const rows = await generatorsApi.data('drainage', today);
            setDrainageData(Array.isArray(rows) ? rows : []);
        } catch (e) {
            console.error('Не удалось загрузить данные дренажа:', e);
            setDrainageData([]);
        }
    };

    // ─── Запуск генератора + опрос статуса ───────────────────
    const runGenerator = async (name, onSuccess, setStatus) => {
        setErrorMsg('');
        setStatus('running');

        try {
            await generatorsApi.run(name);

            const interval = setInterval(async () => {
                try {
                    const s = await generatorsApi.status(name);

                    if (s.status === 'done') {
                        clearInterval(interval);
                        setStatus('idle');
                        onSuccess();
                    } else if (s.status === 'failed') {
                        clearInterval(interval);
                        setStatus('idle');
                        setErrorMsg(
                            `Генератор "${name}" упал: ${s.stderr || 'см. консоль сервера'}`
                        );
                    }
                } catch (e) {
                    clearInterval(interval);
                    setStatus('idle');
                    setErrorMsg('Ошибка при проверке статуса: ' + e.message);
                }
            }, 2000);
        } catch (e) {
            setStatus('idle');
            setErrorMsg('Не удалось запустить генератор: ' + e.message);
        }
    };

    // ─── Кнопка «Данные с приборов» ──────────────────────────
    const canGenerateDevices =
        devicesSeason !== '' && !devicesGenerated && devicesStatus !== 'running';

    const handleGenerateDevices = () => {
        if (!canGenerateDevices) return;

        const name = devicesSeason === 'summer' ? 'devices-summer' : 'devices-offseason';

        runGenerator(
            name,
            async () => {
                localStorage.setItem('dataCollection:devices:lastGen', today);
                setDevicesLastGen(today);
                setDevicesGenerated(true);
                await loadDevicesData();
            },
            setDevicesStatus
        );
    };

    // ─── Кнопка «Дренаж» ─────────────────────────────────────
    const canGenerateDrainage =
        !drainageGenerated && drainageStatus !== 'running';

    const handleGenerateDrainage = () => {
        if (!canGenerateDrainage) return;

        runGenerator(
            'drainage',
            async () => {
                localStorage.setItem('dataCollection:drainage:lastGen', today);
                setDrainageLastGen(today);
                setDrainageGenerated(true);
                await loadDrainageData();
            },
            setDrainageStatus
        );
    };

    // ─── Хелпер: форматирование даты-времени ─────────────────
    const fmtDateTime = (v) => {
        if (!v) return '';
        const d = new Date(v);
        if (isNaN(d.getTime())) return String(v);
        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const fmtNum = (v) => (v === null || v === undefined ? '—' : v);

    return (
        <div className="data-page">
            {errorMsg && (
                <div
                    className="data-hint data-hint--warning"
                    style={{ gridColumn: '1 / -1' }}
                >
                    {errorMsg}
                </div>
            )}

            {/* ════════════ ДАННЫЕ С ПРИБОРОВ ════════════ */}
            <section className="data-card">
                <h2 className="data-card__title">Данные с приборов</h2>

                <div className="data-card__controls">
                    <label className="data-card__label">
                        Сезон:
                        <select
                            className="data-card__select"
                            value={devicesSeason}
                            onChange={(e) => setDevicesSeason(e.target.value)}
                            disabled={devicesGenerated || devicesStatus === 'running'}
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
                                    : devicesStatus === 'running'
                                        ? 'Генерация выполняется...'
                                        : 'Сгенерировать данные'
                        }
                    >
                        {devicesStatus === 'running' ? 'Генерация...' : 'Генерация'}
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

                <div className="data-output data-output--list">
                    {!devicesGenerated && devicesData.length === 0 && (
                        <span className="data-output__empty">
                            Пока ничего не сгенерировано. Выберите сезон и нажмите
                            «Генерация».
                        </span>
                    )}

                    {devicesGenerated && devicesData.length === 0 && (
                        <span className="data-output__empty">
                            Данные за сегодня есть, но записей в БД не найдено.
                        </span>
                    )}

                    {devicesData.length > 0 && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Клапан</th>
                                    <th>Темп., °C</th>
                                    <th>Влажн., %</th>
                                    <th>EC</th>
                                    <th>pH</th>
                                    <th>Погода</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devicesData.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.date || fmtDateTime(row.date)}</td>
                                        <td>{fmtNum(row.valveId)}</td>
                                        <td>{fmtNum(row.dayTemperature)}</td>
                                        <td>{fmtNum(row.avgHumidity)}</td>
                                        <td>{fmtNum(row.avgConductivity)}</td>
                                        <td>{fmtNum(row.avgPh)}</td>
                                        <td>{fmtNum(row.weather)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* ════════════ ДРЕНАЖ ════════════ */}
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
                                : drainageStatus === 'running'
                                    ? 'Генерация выполняется...'
                                    : 'Сгенерировать данные'
                        }
                    >
                        {drainageStatus === 'running' ? 'Генерация...' : 'Генерация'}
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

                <div className="data-output data-output--list">
                    {!drainageGenerated && drainageData.length === 0 && (
                        <span className="data-output__empty">
                            Пока ничего не сгенерировано. Нажмите «Генерация».
                        </span>
                    )}

                    {drainageGenerated && drainageData.length === 0 && (
                        <span className="data-output__empty">
                            Данные за сегодня есть, но записей в БД не найдено.
                        </span>
                    )}

                    {drainageData.length > 0 && (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Время измерения</th>
                                    <th>ID полива</th>
                                    <th>Объём дренажа, л</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drainageData.map((row) => (
                                    <tr key={row.id}>
                                        <td>{fmtDateTime(row.measurementTime)}</td>
                                        <td>{fmtNum(row.wateringId)}</td>
                                        <td>{fmtNum(row.drainVolume)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DataCollectionPage;