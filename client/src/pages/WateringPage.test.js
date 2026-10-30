// client/src/pages/WateringPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WateringPage from './WateringPage';
import { valvesApi } from '../api/valvesApi';
import { tanksApi } from '../api/tanksApi';
import { wateringScheduleApi } from '../api/wateringScheduleApi';
import { wateringApi } from '../api/wateringApi';

jest.mock('../api/valvesApi');
jest.mock('../api/tanksApi');
jest.mock('../api/wateringScheduleApi');
jest.mock('../api/wateringApi');
jest.mock('../components/Toast', () => () => null);

beforeEach(() => {
    jest.clearAllMocks();
    valvesApi.getAll.mockResolvedValue([
        { id: 1, manufacturer: 'Hunter', model: 'PGV-101' },
        { id: 2, manufacturer: 'Netafim', model: 'SH-1' },
    ]);
    tanksApi.getAllWithContents.mockResolvedValue([
        { id: 1, name: 'Бак 1', volume: 500, usedLiters: 100, items: [] },
        { id: 2, name: 'Бак 2', volume: 500, usedLiters: 0, items: [] },
    ]);
    wateringScheduleApi.getByDate.mockResolvedValue([]);
    wateringApi.getByDate.mockResolvedValue([]);
    wateringScheduleApi.save.mockResolvedValue({});
});

describe('WateringPage — базовые сценарии', () => {
    it('рендерит заголовок «Система полива»', async () => {
        render(<WateringPage />);
        expect(
            await screen.findByRole('heading', { name: /Система полива/i })
        ).toBeInTheDocument();
    });

    it('загружает клапаны и баки при монтировании', async () => {
        render(<WateringPage />);
        await waitFor(() => expect(valvesApi.getAll).toHaveBeenCalledTimes(1));
        await waitFor(() =>
            expect(tanksApi.getAllWithContents).toHaveBeenCalledTimes(1)
        );
    });

    it('по умолчанию два периода', async () => {
        render(<WateringPage />);
        expect(await screen.findByText('Период 1')).toBeInTheDocument();
        expect(screen.getByText('Период 2')).toBeInTheDocument();
    });

    it('кнопка «+» добавляет третий период', async () => {
        render(<WateringPage />);
        await screen.findByText('Период 1');

        fireEvent.click(screen.getByTitle('Добавить период'));

        expect(screen.getByText('Период 3')).toBeInTheDocument();
    });

    it('кнопка «×» на периоде открывает модалку удаления', async () => {
        render(<WateringPage />);
        await screen.findByText('Период 1');

        // Сначала добавим третий период — иначе кнопок × нет
        fireEvent.click(screen.getByTitle('Добавить период'));

        const removeButtons = screen.getAllByTitle('Удалить период');
        fireEvent.click(removeButtons[0]);

        expect(
            await screen.findByRole('heading', { name: /Удалить период/i })
        ).toBeInTheDocument();
    });

    it('кнопка «Настройка полива» заблокирована без заполненных периодов', async () => {
        render(<WateringPage />);
        await screen.findByText('Период 1');
        const button = screen.getByRole('button', { name: /Настройка полива/i });
        expect(button).toBeDisabled();
    });

    it('добавление периода больше 3 показывает предупреждение', async () => {
        render(<WateringPage />);
        await screen.findByText('Период 1');

        // Стартуем с 2 → добавим 2 раза, чтобы стало 4
        fireEvent.click(screen.getByTitle('Добавить период'));
        fireEvent.click(screen.getByTitle('Добавить период'));

        expect(
            await screen.findByText(
                /Столько периодов полива может быть нецелесообразно/i
            )
        ).toBeInTheDocument();
    });
});

describe('WateringPage — режим прошлой даты (история)', () => {
    it('при выборе прошлой даты показывает «Просмотр прошлых данных» и таблицу истории', async () => {
        wateringApi.getByDate.mockResolvedValue([
            {
                id: 1,
                startTime: '2026-09-01T08:00:00Z',
                duration: 30,
                waterVolume: 100,
                drains: [{ drainVolume: 15 }],
                condition: { valveId: 1 },
            },
        ]);
        render(<WateringPage />);
        await screen.findByText('Период 1');

        const dateInput = screen.getByDisplayValue(
            new Date().toISOString().slice(0, 10)
        );
        fireEvent.change(dateInput, { target: { value: '2026-09-01' } });

        expect(
            await screen.findByText(/Просмотр прошлых данных/i)
        ).toBeInTheDocument();
        expect(
            await screen.findByRole('heading', {
                name: /Фактические поливы за 2026-09-01/i,
            })
        ).toBeInTheDocument();
    });

    it('при отсутствии данных показывает заглушку', async () => {
        wateringApi.getByDate.mockResolvedValue([]);
        render(<WateringPage />);
        await screen.findByText('Период 1');

        const dateInput = screen.getByDisplayValue(
            new Date().toISOString().slice(0, 10)
        );
        fireEvent.change(dateInput, { target: { value: '2026-09-01' } });

        expect(
            await screen.findByText(
                /За эту дату поливов в системе не зафиксировано/i
            )
        ).toBeInTheDocument();
    });
});

describe('WateringPage — переход ко второму шагу', () => {
    // Заполняет один полный период через data-testid и placeholder
    async function fillOneCompletePeriod() {
        render(<WateringPage />);
        await screen.findByText('Период 1');

        // Время начала — через data-testid, добавленный в WateringPage.js
        const timeInput = screen.getByTestId('period-start-1');
        fireEvent.change(timeInput, { target: { value: '08:00' } });

        // Длительность — по placeholder "мин"
        const durationInputs = screen.getAllByPlaceholderText('мин');
        fireEvent.change(durationInputs[0], { target: { value: '10' } });

        // Объём — по placeholder "до 50000"
        const volumeInputs = screen.getAllByPlaceholderText(/до 50000/);
        fireEvent.change(volumeInputs[0], { target: { value: '100' } });
    }

    it('при заполнении одного полного периода кнопка «Настройка полива» активна', async () => {
        await fillOneCompletePeriod();
        const button = screen.getByRole('button', { name: /Настройка полива/i });
        await waitFor(() => expect(button).not.toBeDisabled());
    });

    it('переход на шаг distribution показывает блок «Настройка клапанов»', async () => {
        await fillOneCompletePeriod();
        fireEvent.click(screen.getByRole('button', { name: /Настройка полива/i }));

        expect(
            await screen.findByRole('heading', { name: /Настройка клапанов/i })
        ).toBeInTheDocument();
        expect(
            await screen.findByText(/Клапан 1: Hunter PGV-101/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Клапан 2: Netafim SH-1/i)
        ).toBeInTheDocument();
    });

    it('на шаге distribution превышение объёма баков показывает предупреждение', async () => {
        await fillOneCompletePeriod();
        fireEvent.click(screen.getByRole('button', { name: /Настройка полива/i }));

        await screen.findByText(/Сколько баков будет задействовано/i);

        // Один бак
        const countInput = screen.getByPlaceholderText('0–2');
        fireEvent.change(countInput, { target: { value: '1' } });

        // Объём в баке больше объёма периода (100)
        const volumeInputs = screen.getAllByPlaceholderText(/до 50000/);
        fireEvent.change(volumeInputs[0], { target: { value: '150' } });

        expect(
            (await screen.findAllByText(/Превышен объём периода/i)).length
        ).toBeGreaterThan(0);
    });
});