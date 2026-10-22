// client/src/data/compatibility.js

export const compatibilityRules = [
    {
        ids: [4, 5],
        reason: 'Кислота и щёлочь нейтрализуют друг друга с выделением тепла и соли.'
    },
    {
        ids: [7, 4],
        reason: 'Гуминовые кислоты выпадают в осадок при pH ниже 6.0.'
    },
    {
        ids: [2, 5],
        reason: 'Фосфаты со щелочными агентами образуют нерастворимые фосфаты кальция и магния.'
    },
    {
        ids: [3, 5],
        reason: 'Гидроксид калия с сульфатом калия может вызвать выпадение сульфатных солей.'
    },
];

export function checkCompatibility(selectedIds) {
    const selected = new Set(selectedIds.filter(Boolean));
    return compatibilityRules.filter((rule) =>
        rule.ids.every((id) => selected.has(id))
    );
}