// client/src/pages/SolutionsPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SolutionsPage from './SolutionsPage';
import {
    fetchTanks,
    createTank,
    updateTank,
    deleteTank,
    fetchSolutionsByTank,
    createSolutionHistory,
    createSolutionComposition,
} from '../http/tankAPI';

jest.mock('../http/tankAPI');
jest.mock('../components/Toast', () => () => null);
jest.mock('../components/SolutionsInfo', () => () => (
    <div data-testid="solutions-info">Информация о добавках</div>
));

beforeEach(() => {
    jest.clearAllMocks();
    fetchTanks.mockResolvedValue([
        { id: 1, volume: 500, purposeId: 2 },
        { id: 2, volume: 800, purposeId: 2 },
    ]);
    fetchSolutionsByTank.mockResolvedValue([]);
    createTank.mockResolvedValue({ id: 3, volume: 2000 });
    updateTank.mockResolvedValue({});
    deleteTank.mockResolvedValue({});
    createSolutionHistory.mockResolvedValue({ id: 1 });
    createSolutionComposition.mockResolvedValue({});
});

describe('SolutionsPage — базовые сценарии', () => {
    it('рендерит две вкладки: «Регуляция смеси» и «Информация»', async () => {
        render(<SolutionsPage />);
        expect(
            await screen.findByRole('button', { name: /Регуляция смеси/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Информация/i })
        ).toBeInTheDocument();
    });

    it('по умолчанию активна вкладка «Регуляция смеси»', async () => {
        render(<SolutionsPage />);
        expect(
            await screen.findByText(/Добавить в раствор/i)
        ).toBeInTheDocument();
    });

    it('переключение на «Информация» показывает SolutionsInfo', async () => {
        render(<SolutionsPage />);
        await screen.findByText(/Добавить в раствор/i);

        fireEvent.click(screen.getByRole('button', { name: /Информация/i }));

        expect(await screen.findByTestId('solutions-info')).toBeInTheDocument();
    });

    it('загружает баки при монтировании', async () => {
        render(<SolutionsPage />);
        await waitFor(() => expect(fetchTanks).toHaveBeenCalledTimes(1));
    });

    it('показывает номер бака в списке баков', async () => {
        render(<SolutionsPage />);
        expect(await screen.findByText('Содержимое:')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('кнопка «+» открывает модалку создания бака', async () => {
        render(<SolutionsPage />);
        await screen.findByText('Содержимое:');

        fireEvent.click(screen.getByTitle('Добавить бак'));

        expect(
            await screen.findByText(/Укажите объём нового бака/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Создать/i })
        ).toBeInTheDocument();
    });

    it('создание бака вызывает createTank и обновляет список', async () => {
        render(<SolutionsPage />);
        await screen.findByText('Содержимое:');

        fireEvent.click(screen.getByTitle('Добавить бак'));
        await screen.findByText(/Укажите объём нового бака/i);

        fireEvent.click(screen.getByRole('button', { name: /Создать/i }));

        await waitFor(() =>
            expect(createTank).toHaveBeenCalledWith({ volume: 2000 })
        );
        // После создания список баков перезагружается
        await waitFor(() =>
            expect(fetchTanks).toHaveBeenCalledTimes(2)
        );
    });

    it('отмена создания бака закрывает модалку без вызова createTank', async () => {
        render(<SolutionsPage />);
        await screen.findByText('Содержимое:');

        fireEvent.click(screen.getByTitle('Добавить бак'));
        await screen.findByText(/Укажите объём нового бака/i);

        fireEvent.click(screen.getByRole('button', { name: /Отмена/i }));

        await waitFor(() =>
            expect(
                screen.queryByText(/Укажите объём нового бака/i)
            ).not.toBeInTheDocument()
        );
        expect(createTank).not.toHaveBeenCalled();
    });

    it('заголовок «Содержимое:» отображается', async () => {
        render(<SolutionsPage />);
        expect(await screen.findByText('Содержимое:')).toBeInTheDocument();
    });

    it('если бак пуст — показывает «Бак пуст»', async () => {
        // По умолчанию fetchSolutionsByTank возвращает [] → бак пуст
        render(<SolutionsPage />);
        expect(await screen.findByText(/Бак пуст/i)).toBeInTheDocument();
    });

    it('подсказка открывается по клику на иконку ⚠', async () => {
        render(<SolutionsPage />);
        await screen.findByText('Содержимое:');

        // Иконка подсказки — по title
        const hintIcon = screen.getByTitle('Подсказка');
        fireEvent.click(hintIcon);

        expect(
            await screen.findByText(/Содержимое на момент создания прошлого раствора/i)
        ).toBeInTheDocument();
    });

    it('в блоке добавления есть поля «Вода» и «Сколько добавить добавок»', async () => {
        render(<SolutionsPage />);
        await screen.findByText(/Добавить в раствор/i);

        expect(screen.getByText(/^Вода$/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Сколько добавить добавок/i)
        ).toBeInTheDocument();
    });

    it('кнопка «Замешать» существует', async () => {
        render(<SolutionsPage />);
        expect(
            await screen.findByRole('button', { name: /Замешать/i })
        ).toBeInTheDocument();
    });
});