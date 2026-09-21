import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registration } from '../http/userAPI';
import { Context } from '../index';
import './RegisterPage.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        login: '',
        password: '',
        confirmPassword: '',
    });
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }

        try {
            const decodedUser = await registration(form.login, form.password);

            user.setUser(decodedUser);
            user.setIsAuth(true);
            localStorage.setItem('username', form.login);

            navigate('/home');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Ошибка регистрации');
        }
    };

    return (
        <div className="auth-page auth-page--right">
            <div className="auth-card">
                <h1 className="auth-title">Регистрация</h1>

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
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Повторите пароль"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                    <button type="submit" className="auth-button">
                        Зарегистрироваться
                    </button>
                </form>

                <p className="auth-footer">
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="auth-link">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;