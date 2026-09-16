import React, { useState, useRef } from 'react';
import './SolutionsPage.css';

const SolutionsPage = () => {

    const [activeTab, setActiveTab] = useState('mix'); // 'mix' | 'info'
    const [isHintOpen, setIsHintOpen] = useState(false);

    // Заглушка
    const [tanks, setTanks] = useState([
        { id: 1, name: 'Бак 1', fill: 100, contents: ['Вода — 100 л.', 'Сульфат …', '…'] },
        { id: 2, name: 'Бак 2', fill: 65, contents: ['Вода — 80 л.', 'Калий …', '…'] },
        { id: 3, name: 'Бак 3', fill: 30, contents: ['Вода — 50 л.', '…', '…'] },
    ]);
    const [activeTankId, setActiveTankId] = useState(tanks[0].id);
    const activeTank = tanks.find((t) => t.id === activeTankId);

    // Поля для добавления в раствор
    const [waterLiters, setWaterLiters] = useState('');
    const [fertilizerLiters, setFertilizerLiters] = useState('');

    // Прокрутка списка баков
    const tanksListRef = useRef(null);
    const scrollTanks = (direction) => {
        if (tanksListRef.current) {
            const amount = 80;
            tanksListRef.current.scrollBy({
                left: direction === 'right' ? amount : -amount,
                behavior: 'smooth',
            });
        }
    };

    // Добавление нового бака
    const addTank = () => {
        const newId = tanks.length ? Math.max(...tanks.map((t) => t.id)) + 1 : 1;
        const newTank = {
            id: newId,
            name: `Бак ${newId}`,
            fill: 0,
            contents: ['Пусто'],
        };
        setTanks([...tanks, newTank]);
        setActiveTankId(newId);
    };

    // Обработчик кнопки «Замешать»
    const handleMix = () => {
        console.log('Замешать:', {
            tank: activeTank.name,
            water: waterLiters,
            fertilizer: fertilizerLiters,
        });
    };

    // "Информация"
    const infoContent = (
        <div className="solutions-info">
            <div className="solutions-info__block">
                <div className="solutions-info__placeholder solutions-info__placeholder--left">
                    <span>Изображение<br />удобрения</span>
                </div>
                <div>
                    <h3>Азотно-фосфорно-калийное удобрение</h3>
                    <p>
                        — это комплексное минеральное удобрение, содержащее три основных макроэлемента
                        питания растений: азот (N), который отвечает за рост зелёной массы и листьев,
                        фосфор (P), стимулирующий развитие корневой системы и цветение, и калий (K),
                        влияющий на качество, вкус и размер плодов, а также повышающий устойчивость
                        культур к засухе, морозам и болезням. Разные культуры и фазы вегетации требуют
                        различных пропорций NPK, поэтому точный подбор формулы под конкретное поле,
                        сезон и тип почвы — ключевая задача агронома, а наше приложение помогает
                        рассчитывать оптимальные дозировки автоматически, чтобы избежать как дефицита,
                        так и перекорма растений.
                    </p>
                </div>
            </div>

            <div className="solutions-info__block">
                <div className="solutions-info__placeholder solutions-info__placeholder--left">
                    <span>Изображение<br />удобрения</span>
                </div>
                <div>
                    <h3>Азотно-фосфорно-калийное удобрение</h3>
                    <p>
                        — это комплексное минеральное удобрение, содержащее три основных макроэлемента
                        питания растений: азот (N), который отвечает за рост зелёной массы и листьев,
                        фосфор (P), стимулирующий развитие корневой системы и цветение, и калий (K),
                        влияющий на качество, вкус и размер плодов, а также повышающий устойчивость
                        культур к засухе, морозам и болезням. Разные культуры и фазы вегетации требуют
                        различных пропорций NPK, поэтому точный подбор формулы под конкретное поле,
                        сезон и тип почвы — ключевая задача агронома, а наше приложение помогает
                        рассчитывать оптимальные дозировки автоматически, чтобы избежать как дефицита,
                        так и перекорма растений.
                    </p>
                </div>
            </div>
        </div>
    );

    const mixContent = (
        <div className="solutions-mix">
            {/* Левая колонка: баки + изображение */}
            <div className="solutions-mix__left">
                <div className="tanks-selector">
                    <div className="tanks-selector__row" ref={tanksListRef}>
                        {tanks.map((tank) => (
                            <button
                                key={tank.id}
                                className={
                                    'tanks-selector__tank' +
                                    (tank.id === activeTankId ? ' tanks-selector__tank--active' : '')
                                }
                                onClick={() => setActiveTankId(tank.id)}
                            >
                                {tank.id}
                            </button>
                        ))}
                        <button className="tanks-selector__add" onClick={addTank} title="Добавить бак">
                            +
                        </button>
                    </div>

                    {/* Ползунок под списком баков */}
                    {tanks.length > 3 && (
                        <div className="tanks-selector__slider">
                            <button
                                className="tanks-selector__arrow"
                                onClick={() => scrollTanks('left')}
                            >
                                ◀
                            </button>
                            <div className="tanks-selector__track">
                                <div className="tanks-selector__thumb" />
                            </div>
                            <button
                                className="tanks-selector__arrow"
                                onClick={() => scrollTanks('right')}
                            >
                                ▶
                            </button>
                        </div>
                    )}
                </div>

                <div className="tank-view">
                    <img src="/bak.png" alt="Бак" className="tank-view__img" />
                    <div className="tank-view__fill">{activeTank.fill}%</div>
                </div>
            </div>

            {/* Правая колонка: информация + добавление + кнопка */}
            <div className="solutions-mix__right">
                <div className="mix-info">
                    <div className="mix-info__header">
                        <h3 className="mix-info__title">Содержимое:</h3>

                        {/* Кнопка-иконка в правом верхнем углу блока */}
                        <button
                            type="button"
                            className="mix-info__hint-icon"
                            onClick={() => setIsHintOpen(true)}
                            aria-label="Показать подсказку"
                            title="Подсказка"
                        >
                            ⚠
                        </button>
                    </div>

                    <ol className="mix-info__list">
                        {activeTank.contents.map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ol>
                </div>

                {/* Всплывающее окно (модалка) */}
                {isHintOpen && (
                    <div className="hint-modal-overlay" onClick={() => setIsHintOpen(false)}>
                        <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="hint-modal__close"
                                onClick={() => setIsHintOpen(false)}
                                aria-label="Закрыть"
                            >
                                ×
                            </button>
                            <div className="hint-modal__icon">⚠</div>
                            <p className="hint-modal__text">
                                *Содержимое на момент создания прошлого раствора.
                                Данные не обновляются динамически.
                            </p>
                        </div>
                    </div>
                )}

                <div className="mix-add">
                    <h3 className="mix-add__title">Добавить в раствор:</h3>
                    <div className="mix-add__row">
                        <label>Вода</label>
                        <input
                            type="number"
                            value={waterLiters}
                            onChange={(e) => setWaterLiters(e.target.value)}
                            className="mix-add__input"
                        />
                        <span>л.</span>
                    </div>
                    <div className="mix-add__row">
                        <label>Маточный раствор удобрений</label>
                        <input
                            type="number"
                            value={fertilizerLiters}
                            onChange={(e) => setFertilizerLiters(e.target.value)}
                            className="mix-add__input"
                        />
                        <span>л.</span>
                    </div>
                </div>

                <button className="mix-button" onClick={handleMix}>
                    Замешать
                </button>
            </div>
        </div>
    );

    return (
        <div className="solutions-page">
            {/* Вкладки */}
            <div className="solutions-tabs">
                <button
                    className={
                        'solutions-tabs__tab' +
                        (activeTab === 'mix' ? ' solutions-tabs__tab--active' : '')
                    }
                    onClick={() => setActiveTab('mix')}
                >
                    Регуляция смеси
                </button>
                <button
                    className={
                        'solutions-tabs__tab' +
                        (activeTab === 'info' ? ' solutions-tabs__tab--active' : '')
                    }
                    onClick={() => setActiveTab('info')}
                >
                    Информация
                </button>
            </div>

            {activeTab === 'mix' ? mixContent : infoContent}
        </div>
    );
};

export default SolutionsPage;