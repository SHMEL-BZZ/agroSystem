import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../http/userAPI';
import { Context } from '../index';
import './LoginPage.css';

const LoginPage = () => {
    const [form, setForm] = useState({
        login: '',
        password: '',
    });
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const decodedUser = await loginRequest(form.login, form.password);

            user.setUser(decodedUser);
            user.setIsAuth(true);
            localStorage.setItem('username', form.login);

            navigate('/home');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Ошибка входа');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">АВТОРИЗАЦИЯ</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        name="login"
                        placeholder="Логин"
                        value={form.login}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={form.password}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                    <button type="submit" className="auth-button">
                        Войти
                    </button>
                </form>

                <p className="auth-footer">
                    Ещё нет аккаунта?{' '}
                    <Link to="/register" className="auth-link">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;