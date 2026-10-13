// client/src/pages/ValvesPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValvesPage from './ValvesPage';
import * as valveAPI from '../http/valveAPI';
import * as greenhouseAPI from '../http/greenhouseAPI';

jest.mock('../http/valveAPI');
jest.mock('../http/greenhouseAPI');

const mockValves = [
    {
        id: 1,
        manufacturer: 'Hunter',
        model: 'PGV-101',
        constructionType: 'электромагнитный',
        diameter: 25.4,
        state: 'работает',
    },
];

const mockGreenhouses = [
    { id: 1, name: 'Блок А', valves: [{ id: 1 }] },
    { id: 2, name: 'Блок Б', valves: [] },
];

beforeEach(() => {
    jest.clearAllMocks();
    valveAPI.fetchValves.mockResolvedValue(mockValves);
    greenhouseAPI.fetchGreenhouses.mockResolvedValue(mockGreenhouses);
    valveAPI.createValve.mockResolvedValue({ id: 2, model: 'PGV-301' });
    valveAPI.linkGreenhouseToValve.mockResolvedValue({});
    valveAPI.unlinkGreenhouseFromValve.mockResolvedValue({});
});

afterEach(() => {
    cleanup();
});

async function openValveModal() {
    render(<ValvesPage />);
    const addBtn = await screen.findByRole('button', { name: /\+ Новый клапан/i });
    fireEvent.click(addBtn);
    await screen.findByRole('heading', { name: /^Новый клапан$/i });
}

function fillForm({ manufacturer = 'Test', model = 'PGV-new', diameter = '25.40' } = {}) {
    if (manufacturer !== null) {
        fireEvent.change(screen.getByPlaceholderText('Например, Hunter'), {
            target: { value: manufacturer },
        });
    }
    if (model !== null) {
        fireEvent.change(screen.getByPlaceholderText('Например, PGV-301'), {
            target: { value: model },
        });
    }
    if (diameter !== null) {
        fireEvent.change(screen.getByPlaceholderText('Например, 25.40'), {
            target: { value: diameter },
        });
    }
}

function clickCreate() {
    fireEvent.click(screen.getByRole('button', { name: /^Создать$/i }));
}

describe('ValvesPage — форма создания клапана', () => {

    describe('Загрузка и открытие модалки', () => {
        it('TC-01: страница рендерится и показывает клапан PGV-101', async () => {
            render(<ValvesPage />);
            expect(
                await screen.findByRole('heading', { name: /PGV-101/i })
            ).toBeInTheDocument();
        });

        it('TC-02: по клику «+ Новый клапан» открывается модалка', async () => {
            await openValveModal();
            expect(
                screen.getByRole('heading', { name: /^Новый клапан$/i })
            ).toBeInTheDocument();
            expect(
                screen.getByPlaceholderText('Например, Hunter')
            ).toBeInTheDocument();
        });
    });

    describe('TC-D. Валидация диаметра', () => {
        it('TC-D1: корректный диаметр 25.40 → createValve вызван с числом 25.4', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '25.40' });
            clickCreate();

            await waitFor(() =>
                expect(valveAPI.createValve).toHaveBeenCalledTimes(1)
            );

            const payload = valveAPI.createValve.mock.calls[0][0];
            expect(payload.diameter).toBe(25.4);
            expect(payload.model).toBe('NEW-1');
        });

        it('TC-D2: граница 0.01 → проходит', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '0.01' });
            clickCreate();
            await waitFor(() => expect(valveAPI.createValve).toHaveBeenCalled());
        });

        it('TC-D3: граница 300 → проходит', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '300' });
            clickCreate();
            await waitFor(() => expect(valveAPI.createValve).toHaveBeenCalled());
        });

        it('TC-D4: 0 → ошибка «минимум 0.01»', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '0' });
            clickCreate();
            expect(
                await screen.findByText(/минимум 0\.01/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });

        it('TC-D5: 301 → ошибка «максимум 300»', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '301' });
            clickCreate();
            expect(
                await screen.findByText(/максимум 300/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });

        it('TC-D6: 25.456 → ошибка «не более 2 знаков»', async () => {
            await openValveModal();
            fillForm({ model: 'NEW-1', diameter: '25.456' });
            clickCreate();
            expect(
                await screen.findByText(/не более 2 знаков/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });
    });

    describe('TC-R. Обязательные поля', () => {
        it('TC-R1: пустой производитель → ошибка «обязательное поле»', async () => {
            await openValveModal();
            fillForm({ manufacturer: '', model: 'NEW-1', diameter: '25.40' });
            clickCreate();
            expect(
                await screen.findByText(/Производитель — обязательное поле/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });

        it('TC-R2: производитель из 1 символа → ошибка «минимум 2 символов»', async () => {
            await openValveModal();
            fillForm({ manufacturer: 'A', model: 'NEW-1', diameter: '25.40' });
            clickCreate();
            expect(
                await screen.findByText(/Производитель: минимум 2/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });

        it('TC-R3: пустая модель → ошибка «обязательное поле»', async () => {
            await openValveModal();
            fillForm({ manufacturer: 'Test', model: '', diameter: '25.40' });
            clickCreate();
            expect(
                await screen.findByText(/Модель — обязательное поле/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });
    });

    describe('TC-M. Уникальность модели', () => {
        it('TC-M1: модель PGV-101 уже существует', async () => {
            await openValveModal();
            fillForm({ manufacturer: 'Test', model: 'PGV-101', diameter: '25.40' });
            clickCreate();
            expect(
                await screen.findByText(/Клапан с такой моделью уже существует/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });

        it('TC-M2: pgv-101 в другом регистре — тоже дубликат', async () => {
            await openValveModal();
            fillForm({ manufacturer: 'Test', model: 'pgv-101', diameter: '25.40' });
            clickCreate();
            expect(
                await screen.findByText(/Клапан с такой моделью уже существует/i)
            ).toBeInTheDocument();
            expect(valveAPI.createValve).not.toHaveBeenCalled();
        });
    });

    describe('TC-S. Успешный сценарий', () => {
        it('TC-S1: валидная форма → createValve вызван один раз с корректным payload', async () => {
            await openValveModal();
            fillForm({
                manufacturer: 'Netafim',
                model: 'NEW-50',
                diameter: '50.8',
            });
            clickCreate();

            await waitFor(() =>
                expect(valveAPI.createValve).toHaveBeenCalledTimes(1)
            );

            const payload = valveAPI.createValve.mock.calls[0][0];
            expect(payload).toEqual(
                expect.objectContaining({
                    manufacturer: 'Netafim',
                    model: 'NEW-50',
                    diameter: 50.8,
                    constructionType: 'электромагнитный',
                    state: 'работает',
                })
            );
        });

        it('TC-S2: диаметр не указан → поле diameter отсутствует в payload', async () => {
            await openValveModal();
            fillForm({ manufacturer: 'Test', model: 'NEW-3', diameter: '' });
            clickCreate();

            await waitFor(() =>
                expect(valveAPI.createValve).toHaveBeenCalledTimes(1)
            );
            const payload = valveAPI.createValve.mock.calls[0][0];
            expect(payload.diameter).toBeUndefined();
        });
    });
});