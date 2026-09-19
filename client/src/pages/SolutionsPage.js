import React, { useState, useRef } from 'react';
import './SolutionsPage.css';
import SolutionsInfo from '../components/SolutionsInfo';
import { solutionAdditives } from '../data/solutionsInfo';

const SolutionsPage = () => {

    const [activeTab, setActiveTab] = useState('mix'); // 'mix' | 'info'
    const [isHintOpen, setIsHintOpen] = useState(false);
    const [tankToDelete, setTankToDelete] = useState(null);

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

    // Сколько добавок хочет ввести пользователь
    const [additivesCount, setAdditivesCount] = useState('');

    // Массив выбранных добавок и объёмов: [{ additiveId, volume }]
    const [additives, setAdditives] = useState([]);

    // Максимально допустимое количество
    const MAX_ADDITIVES = solutionAdditives.length;

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

    const askDeleteTank = (id) => {
        if (tanks.length <= 2) return;   // минимум два бака
        setTankToDelete(id);
    };

    const cancelDeleteTank = () => setTankToDelete(null);

    const confirmDeleteTank = () => {
        setTanks((prev) => {
            const filtered = prev.filter((t) => t.id !== tankToDelete);
            return filtered.map((t, i) => ({
                ...t,
                name: `Бак ${i + 1}`,
            }));
        });

        setActiveTankId((current) => (current === tankToDelete ? 1 : current));
        setTankToDelete(null);
    };

    // Добавление нового бака
    const addTank = () => {
        const newId = tanks.length ? Math.max(...tanks.map((t) => t.id)) + 1 : 1;
        const newName = `Бак ${tanks.length + 1}`;

        const newTank = {
            id: newId,
            name: newName,
            fill: 0,
            contents: ['Пусто'],
        };
        setTanks([...tanks, newTank]);
        setActiveTankId(newId);
    };

    // Изменение количества добавок
    const handleAdditivesCountChange = (value) => {
        if (value === '') {
            setAdditivesCount('');
            setAdditives([]);
            return;
        }

        let num = parseInt(value, 10);
        if (isNaN(num)) return;
        if (num < 0) num = 0;
        if (num > MAX_ADDITIVES) num = MAX_ADDITIVES;

        setAdditivesCount(String(num));

        setAdditives((prev) => {
            const next = [...prev];
            if (next.length < num) {
                for (let i = next.length; i < num; i++) {
                    next.push({ additiveId: '', volume: '' });
                }
            } else if (next.length > num) {
                next.length = num;
            }
            return next;
        });
    };

    // Изменение конкретной строки
    const updateAdditive = (index, field, value) => {
        setAdditives((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    };

    // Обработчик кнопки «Замешать»
    const handleMix = () => {
        console.log('Замешать:', {
            tank: activeTank.name,
            water: waterLiters,
            additives: additives.map((a) => ({
                additive: solutionAdditives.find((s) => s.id === a.additiveId)?.name || '—',
                volume: a.volume,
            })),
        });
    };

    const mixContent = (
        <div className="solutions-mix">
            {/* Левая колонка: баки + изображение */}
            <div className="solutions-mix__left">
                <div className="tanks-selector">
                    <div className="tanks-selector__row" ref={tanksListRef}>
                        {tanks.map((tank, index) => (
                            <div key={tank.id} className="tanks-selector__tank-wrapper">
                                <button
                                    className={
                                        'tanks-selector__tank' +
                                        (tank.id === activeTankId ? ' tanks-selector__tank--active' : '')
                                    }
                                    onClick={() => setActiveTankId(tank.id)}
                                >
                                    {index + 1}
                                </button>

                                {tanks.length > 2 && (
                                    <button
                                        type="button"
                                        className="tanks-selector__remove"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            askDeleteTank(tank.id);
                                        }}
                                        title="Удалить бак"
                                        aria-label="Удалить бак"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="tanks-selector__add" onClick={addTank} title="Добавить бак">
                            +
                        </button>
                    </div>

                    {tankToDelete !== null && (
                        <div className="hint-modal-overlay" onClick={cancelDeleteTank}>
                            <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                                <button
                                    type="button"
                                    className="hint-modal__close"
                                    onClick={cancelDeleteTank}
                                    aria-label="Закрыть"
                                >
                                    ×
                                </button>
                                <div className="hint-modal__icon">⚠</div>
                                <p className="hint-modal__text">
                                    Удалить бак «{tanks.find((t) => t.id === tankToDelete)?.name}»?
                                    Всё его содержимое будет потеряно.
                                </p>
                                <div className="hint-modal__actions">
                                    <button
                                        type="button"
                                        className="hint-modal__btn hint-modal__btn--secondary"
                                        onClick={cancelDeleteTank}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        className="hint-modal__btn hint-modal__btn--danger"
                                        onClick={confirmDeleteTank}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tanks.length > 3 && (
                        <div className="tanks-selector__slider">
                            <button className="tanks-selector__arrow" onClick={() => scrollTanks('left')}>
                                ◀
                            </button>
                            <div className="tanks-selector__track">
                                <div className="tanks-selector__thumb" />
                            </div>
                            <button className="tanks-selector__arrow" onClick={() => scrollTanks('right')}>
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

            {/* Правая колонка */}
            <div className="solutions-mix__right">
                <div className="mix-info">
                    <div className="mix-info__header">
                        <h3 className="mix-info__title">Содержимое:</h3>

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

                {/* Модалка */}
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

                    {/* Вода */}
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

                    {/* Сколько добавить добавок */}
                    <div className="mix-add__row">
                        <label>Сколько добавить добавок</label>
                        <input
                            type="number"
                            min="0"
                            max={MAX_ADDITIVES}
                            value={additivesCount}
                            onChange={(e) => handleAdditivesCountChange(e.target.value)}
                            className="mix-add__input"
                            placeholder={`0–${MAX_ADDITIVES}`}
                        />
                        <span>шт.</span>
                    </div>

                    {/* Динамические строки добавок */}
                    {additives.length > 0 && (
                        <div className="mix-add__additives">
                            {additives.map((row, index) => (
                                <div key={index} className="mix-add__additive-row">
                                    <select
                                        className="mix-add__select"
                                        value={row.additiveId}
                                        onChange={(e) => updateAdditive(index, 'additiveId', e.target.value)}
                                    >
                                        <option value="">— выберите добавку —</option>
                                        {solutionAdditives.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.category})
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="mix-add__input mix-add__input--volume"
                                        placeholder="объём"
                                        value={row.volume}
                                        onChange={(e) => updateAdditive(index, 'volume', e.target.value)}
                                    />
                                    <span>л.</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button className="mix-button" onClick={handleMix}>
                    Замешать
                </button>
            </div>
        </div>
    );

    return (
        <div className="solutions-page">
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

            {activeTab === 'mix' ? mixContent : <SolutionsInfo />}
        </div>
    );
};

export default SolutionsPage;