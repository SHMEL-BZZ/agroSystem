import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../http';
import { setToken, decodeToken } from '../utils/authToken';
import VerifyEmailModal from '../components/VerifyEmailModal';
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

    const [verify, setVerify] = useState(null);
    const [searchParams] = useSearchParams();
    const justActivated = searchParams.get('activated') === '1';
    const badLink = searchParams.get('activated') === '0';

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { token } = await authApi.login(form.login, form.password);
            setToken(token);
            const decodedUser = decodeToken(token);

            user.setUser(decodedUser);
            user.setIsAuth(true);
            localStorage.setItem('username', form.login);

            navigate('/home');
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 403 && data?.code === 'EMAIL_NOT_ACTIVATED') {
                setVerify({ email: data.email || '' });
                return;
            }
            console.error(err);
            alert(data?.message || 'Ошибка входа');
        }
    };

    return (
        <div className="auth-page">
            {verify && (
                <VerifyEmailModal {...verify} onClose={() => setVerify(null)} />
            )}
            <div className="auth-card">
                <h1 className="auth-title">АВТОРИЗАЦИЯ</h1>
                {badLink && (
                    <p className="auth-footer" style={{ color: '#A32A1A', fontWeight: 600, marginTop: 0 }}>
                        Ссылка недействительна или уже использована. Если почта уже подтверждена — просто войдите, иначе зарегистрируйтесь заново
                    </p>
                )}
                {justActivated && (
                    <p className="auth-footer" style={{ color: '#2F5E22', fontWeight: 600, marginTop: 0 }}>
                        Почта подтверждена — теперь можно войти
                    </p>
                )}

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