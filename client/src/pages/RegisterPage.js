import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registration } from '../http/userAPI'; // ВАЖНО: ваш импорт
import VerifyEmailModal from '../components/VerifyEmailModal';
import './RegisterPage.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        login: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [verify, setVerify] = useState(null);

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
            // Токен не выдаётся: сначала нужно подтвердить почту
            const res = await registration(form.login, form.password, form.email);
            setVerify({ email: res.email || form.email, login: form.login });
        } catch (err) {
            console.error(err);
            alert(err.message || 'Ошибка регистрации');
        }
    };

    return (
        <div className="auth-page auth-page--right">
            {verify && (
                <VerifyEmailModal {...verify} onClose={() => setVerify(null)} />
            )}
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
                        type="email"
                        name="email"
                        placeholder="Почта"
                        value={form.email}
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