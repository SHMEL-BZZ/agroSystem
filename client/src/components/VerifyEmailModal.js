import React, { useState } from 'react';
import { authApi } from '../http';
import './VerifyEmailModal.css';

// Окно «Подтвердите почту». Показывается после регистрации и при попытке входа
// с неподтверждённой почтой (сервер отвечает 403 + code EMAIL_NOT_ACTIVATED).
const VerifyEmailModal = ({ email, login, onClose }) => {
    const [status, setStatus] = useState({ text: '', error: false });
    const [busy, setBusy] = useState(false);

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
                    из письма, после этого можно войти в аккаунт.
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
