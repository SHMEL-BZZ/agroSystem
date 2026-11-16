import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registration } from '../http/userAPI';
import { setToken, decodeToken } from '../utils/authToken';
import VerifyEmailModal from '../components/VerifyEmailModal';
import { Context } from '../index';
import './RegisterPage.css';

const RegisterPage = () => {
    const [form, setForm] = useState({
        login: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [verify, setVerify] = useState(null);
    const { user } = useContext(Context);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onVerified = ({ token, user: u }) => {
        setToken(token);
        user.setUser(decodeToken(token));
        user.setIsAuth(true);
        localStorage.setItem('username', u?.login || '');
        navigate('/home');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert('Пароли не совпадают!');
            return;
        }

        try {
            const res = await registration(form.login, form.password, form.email);
            setVerify({
                email: res.email || form.email,
                login: form.login,
                password: form.password,
                onVerified,
            });
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
