import React, { useMemo, useState } from 'react';
import { solutionAdditives, solutionGroups } from '../data/solutionsInfo';

const IMAGE_MAP = {
    1: 'acids',
    2: 'algae',
    3: 'alkalinity',
    4: 'alkalis',
    5: 'complex-bio',
    6: 'humic',
    7: 'nitrogen',
    8: 'phosphorus',
    9: 'potassium'
};

const SolutionsInfo = () => {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return solutionAdditives;

        return solutionAdditives.filter((item) =>
            [item.name, item.category, item.description, item.note]
                .join(' ')
                .toLowerCase()
                .includes(q)
        );
    }, [query]);

    const grouped = useMemo(() => {
        const map = {};
        solutionGroups.forEach((g) => (map[g.id] = []));
        filtered.forEach((item) => {
            if (map[item.group]) map[item.group].push(item);
        });
        return map;
    }, [filtered]);

    const isEmpty = filtered.length === 0;

    return (
        <div className="solutions-info">
            <div className="solutions-info__search">
                <input
                    type="text"
                    className="solutions-info__search-input"
                    placeholder="Поиск по названию, категории или описанию…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button
                        type="button"
                        className="solutions-info__search-clear"
                        onClick={() => setQuery('')}
                        aria-label="Очистить"
                    >
                        ×
                    </button>
                )}
            </div>

            {isEmpty && (
                <div className="solutions-info__empty">
                    Ничего не найдено по запросу «{query}»
                </div>
            )}

            {!isEmpty &&
                solutionGroups.map((group) => {
                    const items = grouped[group.id];
                    if (!items || items.length === 0) return null;

                    return (
                        <section key={group.id} className="solutions-info__group">
                            <h2 className={`solutions-info__group-title solutions-info__group-title--${group.id}`}>
                                {group.title}
                            </h2>

                            <div className="solutions-info__list">
                                {items.map((item) => {
                                    const imageName = IMAGE_MAP[item.id] || item.id;

                                    return (
                                        <article key={item.id} className="solutions-info__block">
                                            <img
                                                src={`/additives/${imageName}.jpg`}
                                                alt={item.name}
                                                className="solutions-info__img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                }}
                                            />

                                            <div className="solutions-info__body">
                                                <div className="solutions-info__category">
                                                    {item.category}
                                                </div>
                                                <h3 className="solutions-info__name">{item.name}</h3>

                                                <p className="solutions-info__description">
                                                    {item.description}
                                                </p>

                                                {item.dosePerLiter && (
                                                    <p className="solutions-info__dose">
                                                        <span className="solutions-info__dose-label">Дозировка:</span>{' '}
                                                        {item.dosePerLiter}
                                                    </p>
                                                )}

                                                {item.composition && (
                                                    <p className="solutions-info__composition">
                                                        <span className="solutions-info__composition-label">Состав:</span>{' '}
                                                        {item.composition}
                                                    </p>
                                                )}

                                                {item.note && (
                                                    <p className="solutions-info__note">
                                                        <span className="solutions-info__note-icon">⚠ </span>
                                                        {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
        </div>
    );
};

export default SolutionsInfo;