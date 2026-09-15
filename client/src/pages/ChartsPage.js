import React, { useState } from 'react';
import './ChartsPage.css';

const ChartsPage = () => {
    // Список графиков с описаниями
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

    // Активный график (по умолчанию — первый)
    const [activeId, setActiveId] = useState(charts[0].id);
    const activeChart = charts.find((c) => c.id === activeId);

    return (
        <div className="charts-page">
            {/* Левая панель — список графиков */}
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

            {/* Правая панель — описание и график */}
            <main className="charts-content">
                <div className="charts-description">
                    <h2 className="charts-description__title">Описание:</h2>
                    <p>{activeChart.description}</p>
                </div>

                <div className="charts-plot">
                    {/*
                        TODO: здесь будет построен график для выбранного пункта.
                    */}
                    <div className="charts-plot__placeholder">
                        <p>Здесь будет график «{activeChart.title}»</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChartsPage;