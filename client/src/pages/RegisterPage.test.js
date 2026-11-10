// client/src/pages/RegisterPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { registration } from '../http/userAPI';

jest.mock('../http/userAPI');

jest.mock('../index', () => {
    const React = require('react');
    return {
        Context: React.createContext({ user: null }),
    };
});

const { Context } = require('../index');

const mockUser = {
    setIsAuth: jest.fn(),
    setUser: jest.fn(),
};

function renderPage() {
    return render(
        <Context.Provider value={{ user: mockUser }}>
            <MemoryRouter initialEntries={['/register']}>
                <RegisterPage />
            </MemoryRouter>
        </Context.Provider>
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

describe('RegisterPage', () => {
    it('рендерит четыре поля: логин, почта, пароль, повтор пароля', () => {
        renderPage();
        expect(screen.getByPlaceholderText('Логин')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Почта')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Повторите пароль')).toBeInTheDocument();
    });

    it('показывает alert, если пароли не совпадают', async () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        renderPage();

        fireEvent.change(screen.getByPlaceholderText('Логин'), {
            target: { value: 'vasya' },
        });
        fireEvent.change(screen.getByPlaceholderText('Почта'), {
            target: { value: 'v@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
            target: { value: 'different' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /Зарегистрироваться/i })
        );

        expect(alertSpy).toHaveBeenCalledWith('Пароли не совпадают!');
        expect(registration).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it('успешная регистрация вызывает registration и setUser', async () => {
        registration.mockResolvedValue({ id: 1, login: 'vasya' });
        renderPage();

        fireEvent.change(screen.getByPlaceholderText('Логин'), {
            target: { value: 'vasya' },
        });
        fireEvent.change(screen.getByPlaceholderText('Почта'), {
            target: { value: 'v@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
            target: { value: '123456' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /Зарегистрироваться/i })
        );

        await waitFor(() =>
            expect(registration).toHaveBeenCalledWith(
                'vasya',
                'v@example.com',
                '123456'
            )
        );
        expect(mockUser.setUser).toHaveBeenCalledWith({ id: 1, login: 'vasya' });
    });

    it('при ошибке регистрации показывает alert', async () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        registration.mockRejectedValue({
            response: { data: { message: 'Логин занят' } },
        });
        renderPage();

        fireEvent.change(screen.getByPlaceholderText('Логин'), {
            target: { value: 'vasya' },
        });
        fireEvent.change(screen.getByPlaceholderText('Почта'), {
            target: { value: 'v@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Пароль'), {
            target: { value: '123456' },
        });
        fireEvent.change(screen.getByPlaceholderText('Повторите пароль'), {
            target: { value: '123456' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: /Зарегистрироваться/i })
        );

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Логин занят'));
        alertSpy.mockRestore();
    });
});