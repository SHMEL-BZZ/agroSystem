// client/src/hooks/useApi.js
import { useCallback, useEffect, useState } from 'react';

/**
 * ќбЄртка над любым асинхронным запросом.
 *
 * @param {Function} apiFn Ч функци€, возвращающа€ Promise
 * @param {Array} deps Ч зависимости дл€ повторного запроса
 * @param {object} options Ч { immediate: true }
 */
export function useApi(apiFn, deps = [], options = {}) {
    const { immediate = true } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFn();
            setData(result);
            return result;
        } catch (e) {
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        if (immediate) {
            execute().catch(() => {
                /* ошибка уже в error */
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [execute]);

    return { data, loading, error, refetch: execute };
}