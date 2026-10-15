import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DataCollectionPage from './DataCollectionPage';
import { generatorsApi } from '../api/generatorsApi';

jest.mock('../api/generatorsApi');

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    generatorsApi.data.mockResolvedValue([]);
    generatorsApi.run.mockResolvedValue({});
    generatorsApi.status.mockResolvedValue({ status: 'done', stdout: 'OK' });
});

describe('DataCollectionPage', () => {
    it('рендерит обе секции: «Данные с приборов» и «Дренаж»', () => {
        render(<DataCollectionPage />);
        expect(
            screen.getByRole('heading', { name: /Данные с приборов/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: /^Дренаж$/i })
        ).toBeInTheDocument();
    });

    it('кнопка «Генерация» для приборов заблокирована без выбора сезона', () => {
        render(<DataCollectionPage />);
        const buttons = screen.getAllByRole('button', { name: /^Генерация$/ });
        // Первая кнопка — для приборов
        expect(buttons[0]).toBeDisabled();
    });

    it('после выбора сезона кнопка генерации активна', () => {
        render(<DataCollectionPage />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'summer' } });
        const buttons = screen.getAllByRole('button', { name: /^Генерация$/ });
        expect(buttons[0]).not.toBeDisabled();
    });

    it('показывает подсказку о генерации один раз в день', () => {
        render(<DataCollectionPage />);
        const hints = screen.getAllByText(/один раз в день/i);
        expect(hints.length).toBe(2); // для обеих секций
    });

    it('показывает заглушку «Пока ничего не сгенерировано» в обеих секциях', () => {
        render(<DataCollectionPage />);
        const placeholders = screen.getAllByText(/Пока ничего не сгенерировано/i);
        expect(placeholders.length).toBe(2);
    });

    it('запускает генератор при клике на «Генерация» (приборы)', async () => {
        render(<DataCollectionPage />);
        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: 'summer' },
        });
        const buttons = screen.getAllByRole('button', { name: /^Генерация$/ });
        fireEvent.click(buttons[0]);

        await waitFor(() =>
            expect(generatorsApi.run).toHaveBeenCalledWith('devices-summer')
        );
    });

    it('запускает генератор при клике на «Генерация» (дренаж)', async () => {
        render(<DataCollectionPage />);
        const buttons = screen.getAllByRole('button', { name: /^Генерация$/ });
        fireEvent.click(buttons[1]); // вторая — дренаж

        await waitFor(() =>
            expect(generatorsApi.run).toHaveBeenCalledWith('drainage')
        );
    });

    it('показывает сообщение о том, что данные уже сгенерированы, если сегодня уже запускали', async () => {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('dataCollection:devices:lastGen', today);
        render(<DataCollectionPage />);

        await waitFor(() =>
            expect(
                screen.getAllByText(new RegExp(`уже сгенерированы`, 'i')).length
            ).toBeGreaterThanOrEqual(1)
        );
    });
});