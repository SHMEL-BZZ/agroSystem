// для запуска client части, команда npm start в папке client в терминале

// client/src/App.js
import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import WateringPage from './pages/WateringPage';
import SolutionsPage from './pages/SolutionsPage';
import ChartsPage from './pages/ChartsPage';
import Navbar from './components/Navbar';
import './App.css';

const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const hideLogout =
        location.pathname === '/login' || location.pathname === '/register';

    const askLogout = () => setIsLogoutConfirmOpen(true);
    const cancelLogout = () => setIsLogoutConfirmOpen(false);

    const confirmLogout = () => {
        setIsLogoutConfirmOpen(false);
        navigate('/login');
    };

    return (
        <>
            {!hideLogout && (
                <button
                    type="button"
                    className="global-logout"
                    onClick={askLogout}
                    title="Выйти"
                    aria-label="Выйти"
                >
                    Выйти
                </button>
            )}

            {isLogoutConfirmOpen && (
                <div className="logout-overlay" onClick={cancelLogout}>
                    <div
                        className="logout-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="logout-modal__close"
                            onClick={cancelLogout}
                            aria-label="Закрыть"
                        >
                            ×
                        </button>

                        <div className="logout-modal__icon">⚠</div>

                        <h3 className="logout-modal__title">
                            Выйти из аккаунта?
                        </h3>
                        <p className="logout-modal__text">
                            Вы уверены, что хотите выйти? Все несохранённые
                            изменения будут потеряны.
                        </p>

                        <div className="logout-modal__actions">
                            <button
                                type="button"
                                className="logout-modal__btn logout-modal__btn--secondary"
                                onClick={cancelLogout}
                            >
                                Отмена
                            </button>
                            <button
                                type="button"
                                className="logout-modal__btn logout-modal__btn--danger"
                                onClick={confirmLogout}
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/home" element={<><Navbar /><HomePage /></>} />
                <Route path="/guide" element={<><Navbar /><GuidePage /></>} />
                <Route path="/watering" element={<><Navbar /><WateringPage /></>} />
                <Route path="/solutions" element={<><Navbar /><SolutionsPage /></>} />
                <Route path="/charts" element={<><Navbar /><ChartsPage /></>} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;