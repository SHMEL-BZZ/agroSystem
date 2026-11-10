// client/src/pages/LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { login as loginRequest } from '../http/userAPI';

jest.mock('../http/userAPI');

// Мок контекста — через require внутри фабрики
jest.mock('../index', () => {
    const React = require('react');
    return {
        Context: React.createContext({ user: null }),
    };
});

const { Context } = require('../index');

const mockUser = {
    isAuth: false,
    setIsAuth: jest.fn(),
    setUser: jest.fn(),
};

function renderPage() {
    return render(
        <Context.Provider value={{ user: mockUser }}>
            <MemoryRouter initialEntries={['/login']}>
                <LoginPage />
            </MemoryRouter>
        </Context.Provider>
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

describe('LoginPage', () => {
    it('рендерит форму с полями логина и пароля', () => {
        renderPage();
        expect(screen.getByPlaceholderText('Логин')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument();
    });

    it('успешный вход вызывает loginRequest и setUser', async () => {
        loginRequest.mockResolvedValue({ id: 1, login: 'vasya' });
        renderPage();

        fireEvent.change(screen.getByPlaceholderText('Логин'), {
            target: { value: 'vasya' },
        });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), {
            target: { value: '123456' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        await waitFor(() =>
            expect(loginRequest).toHaveBeenCalledWith('vasya', '123456')
        );
        expect(mockUser.setUser).toHaveBeenCalledWith({ id: 1, login: 'vasya' });
        expect(mockUser.setIsAuth).toHaveBeenCalledWith(true);
    });

    it('при ошибке входа показывает alert с сообщением сервера', async () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        loginRequest.mockRejectedValue({
            response: { data: { message: 'Неверный логин или пароль' } },
        });

        renderPage();
        fireEvent.change(screen.getByPlaceholderText('Логин'), {
            target: { value: 'vasya' },
        });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), {
            target: { value: 'wrong' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Войти/i }));

        await waitFor(() =>
            expect(alertSpy).toHaveBeenCalledWith('Неверный логин или пароль')
        );
        alertSpy.mockRestore();
    });

    it('содержит ссылку на страницу регистрации', () => {
        renderPage();
        const link = screen.getByRole('link', { name: /Зарегистрироваться/i });
        expect(link).toHaveAttribute('href', '/register');
    });
});