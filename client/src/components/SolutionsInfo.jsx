import React, { useMemo, useState, useEffect } from 'react';
import { fetchAdditives } from '../http/additiveAPI';
import { getUnitForForm } from '../utils/dosing';

const SolutionsInfo = () => {
    const [query, setQuery] = useState('');
    const [additives, setAdditives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdditives()
            .then((data) => {
                setAdditives(data);
                setError(null);
            })
            .catch((err) => {
                console.error('Ошибка загрузки добавок:', err);
                setError('Не удалось загрузить справочник добавок.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return additives;

        return additives.filter((item) =>
            [item.name, item.category, item.description, item.note]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q)
        );
    }, [query, additives]);

    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach((item) => {
            const cat = item.category || 'Прочее';
            if (!map[cat]) map[cat] = [];
            map[cat].push(item);
        });
        return map;
    }, [filtered]);

    if (loading) return <div className="solutions-info__empty">Загрузка справочника...</div>;
    if (error) return <div className="solutions-info__empty" style={{ color: 'red' }}>{error}</div>;

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
                Object.keys(grouped).map((categoryName) => {
                    const items = grouped[categoryName];
                    if (!items || items.length === 0) return null;

                    return (
                        <section key={categoryName} className="solutions-info__group">
                            <h2 className="solutions-info__group-title">
                                {categoryName}
                            </h2>

                            <div className="solutions-info__list">
                                {items.map((item) => (
                                    <article key={item.id} className="solutions-info__block">
                                        <img
                                            src={`/additives/${item.id}.jpg`}
                                            alt={item.name}
                                            className="solutions-info__img"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />

                                        <div className="solutions-info__body">
                                            {item.category && (
                                                <div className="solutions-info__category">
                                                    {item.category}
                                                </div>
                                            )}
                                            <h3 className="solutions-info__name">{item.name}</h3>

                                            {item.description && (
                                                <p className="solutions-info__description">
                                                    {item.description}
                                                </p>
                                            )}

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
                                ))}
                            </div>
                        </section>
                    );
                })}
        </div>
    );
};

export default SolutionsInfo;