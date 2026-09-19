import React, { useState, useEffect } from 'react';
import './ChartsPage.css';
import ChartRenderer from '../components/ChartRenderer';
import { fetchChartData } from '../data/chartsData';

const ChartsPage = () => {
    // список графиков с описаниями
    const charts = [
        {
            id: 'drainage',
            title: 'Дренаж',
            description:
                'График дренажа: соотношение вылитого объёма раствора (полива) и объёма вышедшего дренажа в процентах.',
        },
        {
            id: 'ec-ph',
            title: 'ЕС и pH',
            description:
                'Графики EC и pH: динамика электропроводности и кислотности в подаваемом растворе, корневой зоне (субстрате) и дренаже.',
        },
        {
            id: 'watering',
            title: 'Полив',
            description:
                'График полива: частота, объёмы и время включения клапанов.',
        },
        {
            id: 'starts',
            title: 'Частота и время стартов',
            description:
                'График частоты и времени стартов: столбчатый или линейный график, отображающий точное время каждой выдачи порции воды, интервалы (паузы) между поливами и общую частоту циклов.',
        },
        {
            id: 'feed-ec',
            title: 'ЕС подаваемого раствора',
            description:
                'График EC подаваемого раствора (Feed EC): динамика электропроводности (засоленности / концентрации солей) в контуре полива. Позволяет контролировать стабильность работы дозирующих каналов.',
        },
        {
            id: 'feed-ph',
            title: 'pH подаваемого раствора',
            description:
                'График pH подаваемого раствора (Feed pH): уровень кислотности подаваемой воды. По нему отслеживают точность дозирования кислоты.',
        },
        {
            id: 'water-temp',
            title: 'Температура раствора',
            description:
                'График температуры раствора (Water Temperature): показывает температуру маточного раствора или поливной воды на входе в клапанные группы.',
        },
        {
            id: 'substrate-moisture',
            title: 'Влажность субстрата',
            description:
                'График влажности субстрата (Water Content / WC %): динамика насыщения мата влагой в процентах. На нём чётко видны утренний период насыщения (напитка), дневное плато и ночное подсыхание (night drying-back).',
        },
        {
            id: 'consumption',
            title: 'Расход воды и удобрений',
            description:
                'График общего расхода воды и удобрений (Water and Fertilizer Consumption): накопительные графики кубометров прокачанной воды и литров израсходованных маточных растворов (по каналам A, B, C).',
        },
    ];

    const [activeId, setActiveId] = useState(charts[0].id);
    const [chartConfig, setChartConfig] = useState(null);
    const [loading, setLoading] = useState(false);

    const activeChart = charts.find((c) => c.id === activeId);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setChartConfig(null);

        fetchChartData(activeId)
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

        return () => {
            cancelled = true;
        };
    }, [activeId]);

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