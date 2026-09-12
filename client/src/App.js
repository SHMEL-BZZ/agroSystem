// для запуска client части, команда npm start в папке client в терминале

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import WateringPage from './pages/WateringPage';
import SolutionsPage from './pages/SolutionsPage';
import ChartsPage from './pages/ChartsPage';
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <Routes>
                {/* При запуске перенаправляем на страницу логина */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Страницы авторизации и регистрации */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Основные страницы с навбаром */}
                <Route path="/home" element={<><Navbar /><HomePage /></>} />
                <Route path="/watering" element={<><Navbar /><WateringPage /></>} />
                <Route path="/solutions" element={<><Navbar /><SolutionsPage /></>} />
                <Route path="/charts" element={<><Navbar /><ChartsPage /></>} />
            </Routes>
        </Router>
    );
}

export default App;
