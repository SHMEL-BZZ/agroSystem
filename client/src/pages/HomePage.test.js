// client/src/pages/HomePage.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

describe('HomePage', () => {
    function renderPage() {
        return render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );
    }

    it('рендерит заголовок', () => {
        renderPage();
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading.textContent).toMatch(/Ваши поля/i);
        expect(heading.textContent).toMatch(/В любом месте/i);
    });

    it('содержит ссылку на руководство', () => {
        renderPage();
        const link = screen.getByRole('link', { name: /в руководстве/i });
        expect(link).toHaveAttribute('href', '/guide');
    });

    it('отображает изображение фермера', () => {
        renderPage();
        const img = screen.getByAltText(/Фермер с лейкой/i);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/farmer.png');
    });
});