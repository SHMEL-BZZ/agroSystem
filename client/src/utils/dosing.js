// ============================================================
// Расчёт дозировок добавок
// ============================================================
// dosePerLiter в solutionsInfo имеет вид:
//   '1–2 г на 1 л воды (для маточного раствора — по расчёту EC).'
//   '0.5–1 г монофосфата калия на 1 л; кислоты — по титрованию...'
//   '1–3 мл на 1 л воды (0.1–0.3%).'
//   '0.1–0.5 мл на 1 л воды — до достижения pH 5.5–6.5...'
//   'Дозу кислоты подбирают титрованием; ориентир — 0.1–0.3 мл кислоты на 1 л...'
//
// Мы вытаскиваем первую пару «число–число» и следующую за ней единицу
// («мл» или «г»). Остальное игнорируем.

export function parseDosePerLiter(dosePerLiter) {
    if (!dosePerLiter) return null;

    const match = dosePerLiter.match(
        /(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*(мл|г|л)/i
    );

    if (match) {
        const min = parseFloat(match[1].replace(',', '.'));
        const max = parseFloat(match[2].replace(',', '.'));
        const unit = match[3].toLowerCase();
        return { min, max, unit };
    }

    const single = dosePerLiter.match(/(\d+(?:[.,]\d+)?)\s*(мл|г|л)/i);
    if (single) {
        const value = parseFloat(single[1].replace(',', '.'));
        const unit = single[2].toLowerCase();
        return { min: value, max: value, unit };
    }

    return null;
}

// Единица измерения для добавки: мл — для жидких, г — для сыпучих
export function getUnitForForm(form) {
    return form === 'liquid' ? 'мл' : 'г';
}

// Расчёт дозы на объём воды.
// form — опционально: если задан, единица берётся из него (мл/г),
// иначе — из текста dosePerLiter.
export function calcDose(dosePerLiter, waterLiters, form) {
    const parsed = parseDosePerLiter(dosePerLiter);
    if (!parsed) return null;

    const water = parseFloat(waterLiters);
    if (!water || water <= 0) return null;

    const unit = form ? getUnitForForm(form) : parsed.unit;

    return {
        min: parsed.min * water,
        max: parsed.max * water,
        unit,
    };
}

// Проверка: попадает ли введённый объём в допустимый диапазон.
export function validateDose(dosePerLiter, waterLiters, enteredVolume, form) {
    const expected = calcDose(dosePerLiter, waterLiters, form);
    if (!expected) return { status: 'unknown' };

    const value = parseFloat(enteredVolume);
    if (isNaN(value) || value <= 0) return { status: 'ok', expected };

    const tolerance = 0.1;
    const minAllowed = expected.min * (1 - tolerance);
    const maxAllowed = expected.max * (1 + tolerance);

    if (value < minAllowed) return { status: 'below', expected, value };
    if (value > maxAllowed) return { status: 'above', expected, value };
    return { status: 'ok', expected, value };
}

export function formatDoseRange(range) {
    if (!range) return '';
    if (range.min === range.max) return `${round(range.min)} ${range.unit}`;
    return `${round(range.min)}–${round(range.max)} ${range.unit}`;
}

function round(n) {
    return Math.round(n * 100) / 100;
}