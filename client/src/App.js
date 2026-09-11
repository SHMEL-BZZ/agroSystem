// для запуска client части, команда npm start в папке client в терминале

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import WateringPage from './pages/WateringPage';
import SolutionsPage from './pages/SolutionsPage';
import ChartsPage from './pages/ChartsPage';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/watering" element={<WateringPage />} />
                    <Route path="/solutions" element={<SolutionsPage />} />
                    <Route path="/charts" element={<ChartsPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
