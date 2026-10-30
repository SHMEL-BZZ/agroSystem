import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartsPage from './ChartsPage';
import { fetchChartData } from '../data/chartsData';
import { getAvailableRange } from '../api/chartsApi';

jest.mock('../data/chartsData');
jest.mock('../api/chartsApi');

// Recharts требует ResizeObserver — мокаем в setupTests.js, но на всякий случай
beforeAll(() => {
    global.ResizeObserver = class {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
});

beforeEach(() => {
    jest.clearAllMocks();
    getAvailableRange.mockResolvedValue({
        min: '2026-09-01',
        max: '2026-09-21',
    });
    fetchChartData.mockResolvedValue({
        type: 'line',
        xKey: 'time',
        xLabel: 'Время',
        yLeftLabel: 'EC',
        series: [{ key: 'ec', name: 'EC', color: '#000', unit: 'мСм/см' }],
        data: [{ time: '08:00', ec: 2.1 }],
    });
});

describe('ChartsPage', () => {
    it('рендерит сайдбар со списком графиков', async () => {
        render(<ChartsPage />);
        expect(await screen.findByText('Дренаж')).toBeInTheDocument();
        expect(screen.getByText('ЕС и pH дренажа')).toBeInTheDocument();
        expect(screen.getByText('Полив')).toBeInTheDocument();
        expect(screen.getByText('Расход воды и раствора')).toBeInTheDocument();
    });

    it('загружает доступный диапазон дат и подставляет его в фильтры', async () => {
        render(<ChartsPage />);

        await waitFor(() =>
            expect(getAvailableRange).toHaveBeenCalledTimes(1)
        );

        const inputs = screen.getAllByDisplayValue(/2026-09-01/);
        expect(inputs.length).toBeGreaterThan(0);
    });

    it('загружает данные первого графика при монтировании', async () => {
        render(<ChartsPage />);
        await waitFor(() =>
            expect(fetchChartData).toHaveBeenCalledWith(
                'drainage',
                expect.objectContaining({
                    dateFrom: '2026-09-01',
                    dateTo: '2026-09-21',
                })
            )
        );
    });

    it('переключает график при клике на пункт сайдбара', async () => {
        render(<ChartsPage />);
        await waitFor(() => expect(fetchChartData).toHaveBeenCalled());

        fireEvent.click(screen.getByText('Полив'));

        await waitFor(() =>
            expect(fetchChartData).toHaveBeenCalledWith(
                'watering',
                expect.any(Object)
            )
        );
    });

    it('показывает подсказку про «один день», когда даты совпадают', async () => {
        render(<ChartsPage />);
        await waitFor(() => expect(getAvailableRange).toHaveBeenCalled());

        const inputs = screen.getAllByDisplayValue(/2026-09/);
        const dateFromInput = inputs[0];
        fireEvent.change(dateFromInput, { target: { value: '2026-09-15' } });
        fireEvent.change(inputs[1], { target: { value: '2026-09-15' } });

        expect(
            await screen.findByText(/Выбран один день/i)
        ).toBeInTheDocument();
    });

    it('показывает подсказку про «диапазон», когда даты разные', async () => {
        render(<ChartsPage />);
        await waitFor(() => expect(getAvailableRange).toHaveBeenCalled());

        expect(
            await screen.findByText(/Выбран диапазон дат/i)
        ).toBeInTheDocument();
    });

    it('показывает сообщение, когда данных для графика нет', async () => {
        fetchChartData.mockResolvedValueOnce(null);
        render(<ChartsPage />);

        expect(
            await screen.findByText(/Нет данных для/i)
        ).toBeInTheDocument();
    });
});