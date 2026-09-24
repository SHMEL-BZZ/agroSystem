import React, { useState, useRef, useEffect } from 'react';
import './SolutionsPage.css';
import SolutionsInfo from '../components/SolutionsInfo';
import { solutionAdditives, checkCompatibility } from '../data/solutionsInfo';
import {
    calcDose,
    validateDose,
    formatDoseRange,
    getUnitForForm,
} from '../utils/dosing';

const SolutionsPage = () => {

    const [activeTab, setActiveTab] = useState('mix');
    const [isHintOpen, setIsHintOpen] = useState(false);
    const [tankToDelete, setTankToDelete] = useState(null);

    const [isAddTankOpen, setIsAddTankOpen] = useState(false);
    const [newTankVolume, setNewTankVolume] = useState('2000');

    const [tanks, setTanks] = useState([
        { id: 1, name: 'Бак 1', volume: 2000, usedLiters: 0, items: [] },
        { id: 2, name: 'Бак 2', volume: 2000, usedLiters: 0, items: [] },
        { id: 3, name: 'Бак 3', volume: 2000, usedLiters: 0, items: [] },
    ]);

    const [activeTankId, setActiveTankId] = useState(tanks[0].id);
    const activeTank = tanks.find((t) => t.id === activeTankId);

    const fillPercent = activeTank && activeTank.volume > 0
        ? Math.min(Math.round((activeTank.usedLiters / activeTank.volume) * 100), 100)
        : 0;

    const freeLiters = activeTank
        ? Math.max(activeTank.volume - activeTank.usedLiters, 0)
        : 0;

    const [waterLiters, setWaterLiters] = useState('');
    const [additivesCount, setAdditivesCount] = useState('');
    const [additives, setAdditives] = useState([]);

    const MAX_ADDITIVES = solutionAdditives.length;

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

    // ─── Удаление бака ───
    const askDeleteTank = (id) => {
        if (tanks.length <= 2) return;
        setTankToDelete(id);
    };
    const cancelDeleteTank = () => setTankToDelete(null);

    const confirmDeleteTank = () => {
        setTanks((prev) => {
            const filtered = prev.filter((t) => t.id !== tankToDelete);
            if (tankToDelete === activeTankId && filtered.length > 0) {
                setActiveTankId(filtered[0].id);
            }
            return filtered.map((t, i) => ({ ...t, name: `Бак ${i + 1}` }));
        });
        setTankToDelete(null);
    };

    // ─── Создание бака ───
    const openAddTankDialog = () => {
        setNewTankVolume('2000');
        setIsAddTankOpen(true);
    };
    const cancelAddTank = () => {
        setIsAddTankOpen(false);
        setNewTankVolume('2000');
    };
    const confirmAddTank = () => {
        const volume = parseFloat(newTankVolume);
        if (!volume || volume <= 0) {
            alert('Введите корректный объём бака (больше 0).');
            return;
        }
        const newId = tanks.length ? Math.max(...tanks.map((t) => t.id)) + 1 : 1;
        const newTank = {
            id: newId,
            name: `Бак ${tanks.length + 1}`,
            volume,
            usedLiters: 0,
            items: [],
        };
        setTanks([...tanks, newTank]);
        setActiveTankId(newId);
        setIsAddTankOpen(false);
        setNewTankVolume('2000');
    };

    const handleTankVolumeChange = (value) => {
        const val = parseFloat(value) || 0;
        setTanks((prev) =>
            prev.map((t) => (t.id === activeTankId ? { ...t, volume: val } : t))
        );
    };

    // ─── Количество добавок ───
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
                    next.push({ additiveId: '', volume: '', autoFilled: false });
                }
            } else if (next.length > num) {
                next.length = num;
            }
            return next;
        });
    };

    // ─── База для дозировки ───
    // 1) вода, уже находящаяся в баке;
    // 2) если в баке нет воды — вода, вводимая сейчас.
    const getDoseBase = () => {
        if (activeTank) {
            const waterItem = activeTank.items.find((it) => it.kind === 'water');
            if (waterItem && waterItem.amount > 0) {
                return String(waterItem.amount);
            }
        }
        const w = parseFloat(waterLiters);
        if (!isNaN(w) && w > 0) return String(w);
        return '';
    };

    // ─── Изменение строки добавки ───
    const updateAdditive = (index, field, value) => {
        setAdditives((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                const next = { ...item, [field]: value };

                if (field === 'volume') next.autoFilled = false;

                if (field === 'additiveId') {
                    const additive = solutionAdditives.find((s) => s.id === value);
                    const base = getDoseBase();
                    const dose = additive && base
                        ? calcDose(additive.dosePerLiter, base, additive.form)
                        : null;

                    if (dose) {
                        const mid = (dose.min + dose.max) / 2;
                        next.volume = String(Math.round(mid * 100) / 100);
                        next.autoFilled = true;
                    } else {
                        next.volume = '';
                        next.autoFilled = false;
                    }
                }
                return next;
            })
        );
    };

    // ─── Изменение воды ───
    const handleWaterChange = (value) => {
        setWaterLiters(value);
        setAdditives((prev) =>
            prev.map((item) => {
                if (!item.additiveId) return item;
                const additive = solutionAdditives.find((s) => s.id === item.additiveId);
                if (!additive) return item;
                if (!item.autoFilled && item.volume) return item;

                const base = getDoseBase();
                if (!base) return item;

                const dose = calcDose(additive.dosePerLiter, base, additive.form);
                if (!dose) return item;

                const mid = (dose.min + dose.max) / 2;
                return {
                    ...item,
                    volume: String(Math.round(mid * 100) / 100),
                    autoFilled: true,
                };
            })
        );
    };

    // ─── Пересчёт доз при смене активного бака ───
    useEffect(() => {
        const base = getDoseBase();
        if (!base) return;

        setAdditives((prev) => {
            let changed = false;
            const next = prev.map((item) => {
                if (!item.additiveId) return item;
                const additive = solutionAdditives.find((s) => s.id === item.additiveId);
                if (!additive) return item;
                if (!item.autoFilled && item.volume) return item;

                const dose = calcDose(additive.dosePerLiter, base, additive.form);
                if (!dose) return item;
                const mid = (dose.min + dose.max) / 2;
                const rounded = String(Math.round(mid * 100) / 100);
                if (rounded === item.volume) return item;
                changed = true;
                return { ...item, volume: rounded, autoFilled: true };
            });
            return changed ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTankId]);

    // ─── Предупреждение: добавка уже есть в баке ───
    const alreadyInTankWarnings = additives.map((row) => {
        if (!row.additiveId) return null;
        const additive = solutionAdditives.find((s) => s.id === row.additiveId);
        if (!additive) return null;

        const existing = activeTank.items.find(
            (it) => it.kind === 'additive' && it.id === additive.id
        );
        if (!existing) return null;

        return {
            additiveName: additive.name,
            existingAmount: existing.amount,
            existingUnit: existing.unit,
        };
    }).filter(Boolean);

    // ─── pendingLiters ───
    const pendingLiters = (() => {
        let sum = 0;
        const water = parseFloat(waterLiters);
        if (!isNaN(water) && water > 0) sum += water;

        additives.forEach((row) => {
            const additive = solutionAdditives.find((s) => s.id === row.additiveId);
            if (additive && additive.form === 'liquid' && row.volume) {
                const v = parseFloat(row.volume);
                if (!isNaN(v) && v > 0) sum += v / 1000;
            }
        });
        return sum;
    })();

    const exceedsTank = activeTank && pendingLiters > freeLiters;

    // ─── Совместимость ───
    const tankAdditiveIds = activeTank
        ? activeTank.items.filter((it) => it.kind === 'additive').map((it) => it.id)
        : [];

    const selectedIds = additives.map((a) => a.additiveId).filter(Boolean);

    const violationsAmongSelected = checkCompatibility(selectedIds);

    const violationsWithTank = [];
    selectedIds.forEach((newId) => {
        const combined = [...tankAdditiveIds, newId];
        const rules = checkCompatibility(combined);
        rules.forEach((rule) => {
            if (rule.ids.includes(newId)) {
                const conflicting = rule.ids.filter(
                    (id) => id !== newId && tankAdditiveIds.includes(id)
                );
                if (conflicting.length > 0) {
                    const conflictingName = conflicting
                        .map((id) => solutionAdditives.find((s) => s.id === id)?.name)
                        .filter(Boolean)
                        .join(', ');
                    if (!violationsWithTank.some((v) => v.reason === rule.reason)) {
                        violationsWithTank.push({
                            reason: rule.reason,
                            conflictingName,
                        });
                    }
                }
            }
        });
    });

    const allViolations = [
        ...violationsAmongSelected.map((v) => ({ ...v, scope: 'selected' })),
        ...violationsWithTank.map((v) => ({ ...v, scope: 'tank' })),
    ];

    // ─── Проверка дозировок ───
    const doseWarnings = additives.map((row) => {
        if (!row.additiveId || !row.volume) return null;
        const additive = solutionAdditives.find((s) => s.id === row.additiveId);
        if (!additive) return null;

        const base = getDoseBase();
        if (!base) return null;

        const check = validateDose(
            additive.dosePerLiter,
            base,
            row.volume,
            additive.form
        );
        if (check.status === 'ok' || check.status === 'unknown') return null;

        return {
            additiveName: additive.name,
            status: check.status,
            expected: check.expected,
        };
    }).filter(Boolean);

    // Блокировка: только несовместимость и превышение объёма.
    // Дозировки и «уже в баке» — не блокируют.
    const canMix = allViolations.length === 0 && !exceedsTank;

    // ─── Замешать ───
    const handleMix = () => {
        if (!activeTank) return;

        if (exceedsTank) {
            alert(
                `Превышен объём бака. Свободно ${freeLiters.toFixed(2)} л, `
                + `а вы пытаетесь добавить ${pendingLiters.toFixed(2)} л.`
            );
            return;
        }
        if (allViolations.length > 0) {
            alert('Нельзя замешать: есть несовместимые добавки.');
            return;
        }

        const newItems = [];
        let addedLiters = 0;

        const water = parseFloat(waterLiters);
        if (!isNaN(water) && water > 0) {
            newItems.push({
                kind: 'water',
                name: 'Вода',
                amount: water,
                unit: 'л',
            });
            addedLiters += water;
        }

        additives.forEach((row) => {
            const additive = solutionAdditives.find((s) => s.id === row.additiveId);
            if (!additive) return;
            const v = parseFloat(row.volume);
            if (isNaN(v) || v <= 0) return;

            newItems.push({
                kind: 'additive',
                id: additive.id,
                name: additive.name,
                amount: v,
                unit: getUnitForForm(additive.form),
                form: additive.form,
            });

            if (additive.form === 'liquid') {
                addedLiters += v / 1000;
            }
        });

        if (newItems.length === 0) {
            alert('Введите хотя бы один компонент для замеса.');
            return;
        }

        setTanks((prev) =>
            prev.map((t) => {
                if (t.id !== activeTankId) return t;
                const merged = mergeItems(t.items, newItems);
                return {
                    ...t,
                    usedLiters: Math.min(t.usedLiters + addedLiters, t.volume),
                    items: merged,
                };
            })
        );

        setWaterLiters('');
        setAdditivesCount('');
        setAdditives([]);
    };

    function mergeItems(oldItems, newItems) {
        const result = oldItems.map((it) => ({ ...it }));

        newItems.forEach((n) => {
            if (n.kind === 'water') {
                const existing = result.find((r) => r.kind === 'water');
                if (existing) existing.amount += n.amount;
                else result.push({ ...n });
                return;
            }
            const existing = result.find(
                (r) => r.kind === 'additive' && r.id === n.id
            );
            if (existing) existing.amount += n.amount;
            else result.push({ ...n });
        });

        return result;
    }

    const renderContents = () => {
        if (!activeTank.items.length) {
            return <p className="mix-info__empty">Бак пуст</p>;
        }
        return (
            <ol className="mix-info__list">
                {activeTank.items.map((it, i) => (
                    <li key={i}>{`${it.name} — ${it.amount} ${it.unit}.`}</li>
                ))}
            </ol>
        );
    };

    const mixContent = (
        <div className="solutions-mix">
            {/* Левая колонка */}
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
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            className="tanks-selector__add"
                            onClick={openAddTankDialog}
                            title="Добавить бак"
                        >
                            +
                        </button>
                    </div>

                    {tankToDelete !== null && (
                        <div className="hint-modal-overlay" onClick={cancelDeleteTank}>
                            <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="hint-modal__close" onClick={cancelDeleteTank}>×</button>
                                <div className="hint-modal__icon">⚠</div>
                                <p className="hint-modal__text">
                                    Удалить бак «{tanks.find((t) => t.id === tankToDelete)?.name}»?
                                    Всё его содержимое будет потеряно.
                                </p>
                                <div className="hint-modal__actions">
                                    <button type="button" className="hint-modal__btn hint-modal__btn--secondary" onClick={cancelDeleteTank}>Отмена</button>
                                    <button type="button" className="hint-modal__btn hint-modal__btn--danger" onClick={confirmDeleteTank}>Удалить</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isAddTankOpen && (
                        <div className="hint-modal-overlay" onClick={cancelAddTank}>
                            <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                                <button type="button" className="hint-modal__close" onClick={cancelAddTank}>×</button>
                                <div className="hint-modal__icon">🛢</div>
                                <p className="hint-modal__text">Укажите объём нового бака:</p>
                                <div className="hint-modal__input-row">
                                    <input
                                        type="number"
                                        min="1"
                                        value={newTankVolume}
                                        onChange={(e) => setNewTankVolume(e.target.value)}
                                        className="hint-modal__input"
                                        autoFocus
                                    />
                                    <span>л.</span>
                                </div>
                                <div className="hint-modal__actions">
                                    <button type="button" className="hint-modal__btn hint-modal__btn--secondary" onClick={cancelAddTank}>Отмена</button>
                                    <button type="button" className="hint-modal__btn hint-modal__btn--primary" onClick={confirmAddTank}>Создать</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {tanks.length > 3 && (
                        <div className="tanks-selector__slider">
                            <button className="tanks-selector__arrow" onClick={() => scrollTanks('left')}>◀</button>
                            <div className="tanks-selector__track">
                                <div className="tanks-selector__thumb" />
                            </div>
                            <button className="tanks-selector__arrow" onClick={() => scrollTanks('right')}>▶</button>
                        </div>
                    )}
                </div>

                <div className="tank-view">
                    <img src="/bak.png" alt="Бак" className="tank-view__img" />
                    <div className="tank-view__fill">{fillPercent}%</div>
                </div>

                <div className="tank-volume">
                    <div className="tank-volume__row">
                        <label>Объём бака</label>
                        <input
                            type="number"
                            min="1"
                            value={activeTank.volume}
                            onChange={(e) => handleTankVolumeChange(e.target.value)}
                            className="tank-volume__input"
                        />
                        <span>л.</span>
                    </div>
                    <div className="tank-volume__info">
                        Заполнено: <b>{activeTank.usedLiters.toFixed(2)} л</b> из {activeTank.volume} л
                        {' · '}свободно <b>{freeLiters.toFixed(2)} л</b>
                    </div>
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
                            title="Подсказка"
                        >
                            ⚠
                        </button>
                    </div>
                    {renderContents()}
                </div>

                {isHintOpen && (
                    <div className="hint-modal-overlay" onClick={() => setIsHintOpen(false)}>
                        <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="hint-modal__close" onClick={() => setIsHintOpen(false)}>×</button>
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
                            onChange={(e) => handleWaterChange(e.target.value)}
                            className="mix-add__input"
                        />
                        <span>л.</span>
                    </div>

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

                    {additives.length > 0 && (
                        <div className="mix-add__additives">
                            {additives.map((row, index) => {
                                const additive = solutionAdditives.find((s) => s.id === row.additiveId);
                                const unit = additive ? getUnitForForm(additive.form) : '';
                                const base = getDoseBase();

                                // id, которые уже выбраны в других строках
                                const usedElsewhere = additives
                                    .map((r, i) => (i === index ? null : r.additiveId))
                                    .filter(Boolean);

                                // Доступные добавки: все, кроме выбранных в других строках
                                const availableAdditives = solutionAdditives.filter(
                                    (s) => !usedElsewhere.includes(s.id)
                                );

                                const expected = additive && base
                                    ? calcDose(additive.dosePerLiter, base, additive.form)
                                    : null;
                                const check = additive && base && row.volume
                                    ? validateDose(
                                        additive.dosePerLiter,
                                        base,
                                        row.volume,
                                        additive.form
                                    )
                                    : null;
                                const isInvalid = check && (check.status === 'below' || check.status === 'above');

                                return (
                                    <div key={index} className="mix-add__additive-row">
                                        <select
                                            className="mix-add__select"
                                            value={row.additiveId}
                                            onChange={(e) => updateAdditive(index, 'additiveId', e.target.value)}
                                        >
                                            <option value="">— выберите добавку —</option>
                                            {availableAdditives.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.category})
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className={
                                                'mix-add__input mix-add__input--volume' +
                                                (isInvalid ? ' mix-add__input--invalid' : '')
                                            }
                                            placeholder={unit ? `объём, ${unit}` : 'объём'}
                                            value={row.volume}
                                            onChange={(e) => updateAdditive(index, 'volume', e.target.value)}
                                        />
                                        <span className="mix-add__unit">{unit}</span>

                                        {expected && (
                                            <div className="mix-add__dose-hint">
                                                Рекомендуется: {formatDoseRange(expected)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pendingLiters > 0 && (
                        <div className="mix-add__summary">
                            К добавлению: <b>{pendingLiters.toFixed(2)} л</b>
                            {' · '}свободно в баке: <b>{freeLiters.toFixed(2)} л</b>
                        </div>
                    )}
                </div>

                {/* Превышение объёма — блокирует */}
                {exceedsTank && (
                    <div className="mix-warning mix-warning--danger">
                        <div className="mix-warning__title">⚠ Превышен объём бака:</div>
                        <p>
                            В баке свободно только <b>{freeLiters.toFixed(2)} л</b>,
                            а вы пытаетесь добавить <b>{pendingLiters.toFixed(2)} л</b>.
                        </p>
                    </div>
                )}

                {/* Несовместимость между выбранными — блокирует */}
                {violationsAmongSelected.length > 0 && (
                    <div className="mix-warning mix-warning--danger">
                        <div className="mix-warning__title">⚠ Несовместимые добавки между собой:</div>
                        <ul className="mix-warning__list">
                            {violationsAmongSelected.map((v, i) => (
                                <li key={i}>{v.reason}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Несовместимость с содержимым бака — блокирует */}
                {violationsWithTank.length > 0 && (
                    <div className="mix-warning mix-warning--danger">
                        <div className="mix-warning__title">
                            ⚠ Нельзя добавить — конфликт с содержимым бака:
                        </div>
                        <ul className="mix-warning__list">
                            {violationsWithTank.map((v, i) => (
                                <li key={i}>
                                    <b>{v.conflictingName}</b> уже в баке. {v.reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* «Уже в баке» — НЕ блокирует */}
                {alreadyInTankWarnings.length > 0 && (
                    <div className="mix-warning mix-warning--warning">
                        <div className="mix-warning__title">
                            ⚠ Такая добавка уже есть в баке:
                        </div>
                        <ul className="mix-warning__list">
                            {alreadyInTankWarnings.map((w, i) => (
                                <li key={i}>
                                    <b>{w.additiveName}</b> — уже добавлено{' '}
                                    <b>{w.existingAmount} {w.existingUnit}</b>. Новое количество будет прибавлено к текущему.
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Дозировка вне диапазона — НЕ блокирует */}
                {doseWarnings.length > 0 && (
                    <div className="mix-warning mix-warning--warning">
                        <div className="mix-warning__title">⚠ Проверьте дозировки:</div>
                        <ul className="mix-warning__list">
                            {doseWarnings.map((w, i) => (
                                <li key={i}>
                                    <b>{w.additiveName}:</b>{' '}
                                    {w.status === 'above' ? 'превышена' : 'занижена'}{' '}
                                    — рекомендуемый диапазон{' '}
                                    <b>{formatDoseRange(w.expected)}</b>.
                                </li>
                            ))}
                        </ul>
                        <p className="mix-warning__hint">
                            Это не блокирует замес — вы можете продолжить.
                        </p>
                    </div>
                )}

                <button
                    className="mix-button"
                    onClick={handleMix}
                    disabled={!canMix}
                    title={!canMix ? 'Есть проблемы с совместимостью или объёмом' : 'Замешать'}
                >
                    Замешать
                </button>
            </div>
        </div>
    );

    return (
        <div className={'solutions-page' + (activeTab === 'info' ? ' solutions-page--no-bg' : '')}>
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