import { $authHost, $host } from './index';

// баки
export const fetchTanks = async () => {
    const { data } = await $host.get('api/tank');
    return data;
};

export const createTank = async ({ volume, purposeId }) => {
    const { data } = await $authHost.post('api/tank', { volume, purposeId });
    return data;
};

export const updateTank = async (id, { volume, purposeId }) => {
    const { data } = await $authHost.put(`api/tank/${id}`, { volume, purposeId });
    return data;
};

export const deleteTank = async (id) => {
    const { data } = await $authHost.delete(`api/tank/${id}`);
    return data;
};

// история раствора
export const fetchSolutionsByTank = async (tankId) => {
    const { data } = await $authHost.get(
        `api/solution-history?tankId=${tankId}&limit=200`
    );
    return data;
};

export const createSolutionHistory = async ({ tankId, totalVolume, date }) => {
    const { data } = await $authHost.post('api/solution-history', {
        tankId,
        totalVolume,
        date,
    });
    return data;
};

// состав раствора
export const createSolutionComposition = async ({
                                                    solutionId,
                                                    additiveId,
                                                    amount,
                                                    unit,
                                                }) => {
    const { data } = await $authHost.post('api/solution-composition', {
        solutionId,
        additiveId,
        amount,
        unit,
    });
    return data;
};

export const fetchCompositionBySolution = async (solutionId) => {
    const { data } = await $host.get(
        `api/solution-composition?solutionId=${solutionId}`
    );
    return data;
};