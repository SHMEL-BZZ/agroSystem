import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../http';
import './VerifyEmailModal.css';

const POLL_INTERVAL = 3000;            // как часто проверяем, подтверждена ли почта
const POLL_TIMEOUT = 15 * 60 * 1000;   // через 15 минут перестаём опрашивать

// Окно «Подтвердите почту». Показывается после регистрации и при попытке входа.
// Если передан password + onVerified, окно само дожидается подтверждения почты
// и автоматически выполняет вход (в том числе когда ссылка открыта в другой вкладке/на другом устройстве).
const VerifyEmailModal = ({ email, login, password, onVerified, onClose }) => {
    const [status, setStatus] = useState({ text: '', error: false });
    const [busy, setBusy] = useState(false);
    const onVerifiedRef = useRef(onVerified);
    onVerifiedRef.current = onVerified;

    useEffect(() => {
        if (!password || !onVerifiedRef.current) return undefined;

        let stopped = false;
        let timer = null;
        const startedAt = Date.now();

        const tick = async () => {
            if (stopped) return;
            try {
                const data = await authApi.login(login || email, password); // { token, user }
                if (stopped) return;
                stopped = true;
                onVerifiedRef.current(data);
                return;
            } catch (e) {
                // Пока почта не подтверждена, вход вернёт ошибку — просто ждём дальше
            }
            if (!stopped && Date.now() - startedAt < POLL_TIMEOUT) {
                timer = setTimeout(tick, POLL_INTERVAL);
            }
        };

        timer = setTimeout(tick, POLL_INTERVAL);
        return () => {
            stopped = true;
            clearTimeout(timer);
        };
    }, [login, email, password]);

    const resend = async () => {
        setBusy(true);
        try {
            await authApi.resendActivation(login || email);
            setStatus({ text: 'Письмо отправлено повторно', error: false });
        } catch (e) {
            setStatus({
                text: e.response?.data?.message || 'Не удалось отправить письмо',
                error: true,
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="logout-overlay" onClick={onClose}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="logout-modal__close"
                    onClick={onClose}
                    aria-label="Закрыть"
                >
                    ✕
                </button>
                <div className="logout-modal__icon">✉️</div>
                <h3 className="logout-modal__title">Подтвердите почту</h3>
                <p className="logout-modal__text">
                    Мы отправили письмо на <b>{email}</b>. Перейдите по ссылке
                    из письма
                    {password && onVerified
                        ? ' — после этого вы войдёте в аккаунт автоматически.'
                        : ', после этого можно войти в аккаунт.'}
                </p>
                {status.text && (
                    <p
                        className={
                            'verify-modal__status' +
                            (status.error ? ' verify-modal__status--error' : '')
                        }
                    >
                        {status.text}
                    </p>
                )}
                <div className="logout-modal__actions">
                    <button
                        type="button"
                        className="logout-modal__btn logout-modal__btn--secondary"
                        onClick={resend}
                        disabled={busy}
                    >
                        Отправить ещё раз
                    </button>
                    <button
                        type="button"
                        className="logout-modal__btn logout-modal__btn--danger"
                        onClick={onClose}
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailModal;
