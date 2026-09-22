import React, { useState, useEffect, useMemo } from 'react';
import './ChartsPage.css';
import ChartRenderer from '../components/ChartRenderer';
import { fetchChartData } from '../data/chartsData';

const ChartsPage = () => {
    const charts = [
        { id: 'drainage', title: 'Дренаж', description: 'График дренажа: соотношение вылитого объёма раствора (полива) и объёма вышедшего дренажа в процентах.' },
        { id: 'ec-ph', title: 'ЕС и pH', description: 'Графики EC и pH: динамика электропроводности и кислотности в подаваемом растворе, корневой зоне (субстрате) и дренаже.' },
        { id: 'watering', title: 'Полив', description: 'График полива: частота, объёмы и время включения клапанов.' },
        { id: 'starts', title: 'Частота и время стартов', description: 'График частоты и времени стартов: точное время каждой выдачи воды и интервалы между поливами.' },
        { id: 'feed-ec', title: 'ЕС подаваемого раствора', description: 'График EC подаваемого раствора (Feed EC): динамика засоленности в контуре полива.' },
        { id: 'feed-ph', title: 'pH подаваемого раствора', description: 'График pH подаваемого раствора (Feed pH): уровень кислотности подаваемой воды.' },
        { id: 'water-temp', title: 'Температура раствора', description: 'График температуры раствора (Water Temperature).' },
        { id: 'substrate-moisture', title: 'Влажность субстрата', description: 'График влажности субстрата (Water Content / WC %).' },
        { id: 'consumption', title: 'Расход воды и удобрений', description: 'Накопительные графики кубометров воды и литров маточных растворов (по каналам A, B, C).' },
    ];

    const AVAILABLE_DATES = [
        '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18',
        '2026-09-19', '2026-09-20', '2026-09-21',
    ];

    const DEFAULT_DATE_FROM = AVAILABLE_DATES[0];
    const DEFAULT_DATE_TO = AVAILABLE_DATES[AVAILABLE_DATES.length - 1];

    const [activeId, setActiveId] = useState(charts[0].id);
    const [chartConfig, setChartConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    // Диапазон дат
    const [dateFrom, setDateFrom] = useState(DEFAULT_DATE_FROM);
    const [dateTo, setDateTo] = useState(DEFAULT_DATE_TO);

    const activeChart = charts.find((c) => c.id === activeId);

    // Режим: день / диапазон — по выбранным датам
    const isSingleDay = dateFrom === dateTo;

    // Загрузка графика
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setChartConfig(null);

        fetchChartData(activeId, { dateFrom, dateTo })
            .then((config) => {
                if (!cancelled) setChartConfig(config);
            })
            .catch((err) => {
                console.error('Ошибка загрузки графика:', err);
                if (!cancelled) setChartConfig(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [activeId, dateFrom, dateTo]);

    // ─── Обработчики с валидацией ───
    const handleDateFromChange = (value) => {
        if (value > dateTo) {
            // если новая "С" позже "По" — двигаем и "По"
            setDateFrom(value);
            setDateTo(value);
        } else {
            setDateFrom(value);
        }
    };

    const handleDateToChange = (value) => {
        if (value < dateFrom) {
            // если новая "По" раньше "С" — двигаем и "С"
            setDateTo(value);
            setDateFrom(value);
        } else {
            setDateTo(value);
        }
    };

    return (
        <div className="charts-page">
            <aside className="charts-sidebar">
                {charts.map((chart) => (
                    <button
                        key={chart.id}
                        className={
                            'charts-sidebar__item' +
                            (chart.id === activeId ? ' charts-sidebar__item--active' : '')
                        }
                        onClick={() => setActiveId(chart.id)}
                    >
                        {chart.title}
                    </button>
                ))}
            </aside>

            <main className="charts-content">
                <div className="charts-description">
                    <h2 className="charts-description__title">Описание:</h2>
                    <p>{activeChart.description}</p>
                </div>

                {/* Панель выбора периода */}
                <div className="charts-filters">
                    <div className="charts-filters__group">
                        <label>С</label>
                        <input
                            type="date"
                            min={AVAILABLE_DATES[0]}
                            max={dateTo}
                            value={dateFrom}
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            className="charts-filters__input"
                        />
                    </div>

                    <div className="charts-filters__group">
                        <label>По</label>
                        <input
                            type="date"
                            min={dateFrom}
                            max={AVAILABLE_DATES[AVAILABLE_DATES.length - 1]}
                            value={dateTo}
                            onChange={(e) => handleDateToChange(e.target.value)}
                            className="charts-filters__input"
                        />
                    </div>

                    <div className={`charts-filters__hint ${isSingleDay ? 'charts-filters__hint--day' : 'charts-filters__hint--range'}`}>
                        {isSingleDay
                            ? 'Выбран один день — на графике будет отображаться время за целый день.'
                            : 'Выбран диапазон дат — на графике будут отображаться усреднённые значения по датам.'}
                    </div>
                </div>

                <div className="charts-plot">
                    {loading && (
                        <div className="charts-plot__placeholder">
                            <p>Загрузка данных…</p>
                        </div>
                    )}

                    {!loading && chartConfig && (
                        <div className="charts-plot__canvas">
                            <ChartRenderer config={chartConfig} />
                        </div>
                    )}

                    {!loading && !chartConfig && (
                        <div className="charts-plot__placeholder">
                            <p>Нет данных для «{activeChart.title}»</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ChartsPage;