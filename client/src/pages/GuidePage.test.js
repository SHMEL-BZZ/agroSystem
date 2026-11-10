import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GuidePage from './GuidePage';

describe('GuidePage', () => {
    it('рендерит заголовок «Руководство пользователя»', () => {
        render(<GuidePage />);
        expect(
            screen.getByRole('heading', { level: 1, name: /Руководство пользователя/i })
        ).toBeInTheDocument();
    });

    it('рендерит содержание со ссылками на все секции', () => {
        render(<GuidePage />);
        // Смотрим несколько известных секций
        expect(screen.getByRole('link', { name: /Полив — настройка периодов/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Клапаны/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Сбор данных/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Графики/i })).toBeInTheDocument();
    });

    it('секции GuidePage имеют соответствующие якоря', () => {
        render(<GuidePage />);
        // Каждая секция содержит ссылку «К содержанию» → считаем их
        const backLinks = screen.getAllByRole('link', { name: /К содержанию/i });
        expect(backLinks.length).toBeGreaterThanOrEqual(6);
    });

    it('содержит кнопки «К содержанию» в каждой секции', () => {
        render(<GuidePage />);
        const backLinks = screen.getAllByRole('link', { name: /К содержанию/i });
        expect(backLinks.length).toBeGreaterThanOrEqual(6);
        // Проверяем, что ведут на #guide-top
        backLinks.forEach((link) => {
            expect(link).toHaveAttribute('href', '#guide-top');
        });
    });

    it('заголовок секции «Полив — настройка периодов» присутствует', () => {
        render(<GuidePage />);
        expect(
            screen.getByRole('heading', { name: /Полив — настройка периодов/i })
        ).toBeInTheDocument();
    });
});