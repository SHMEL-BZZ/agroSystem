import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <div className="hero-text">
                    <h1>Ваши поля — под вашим контролем. <br /> В любое время. В любом месте</h1>
                    <p>
                        Превратите обычный полив в точную науку. Приложение подскажет, когда, <br />
                        сколько и где полить, учитывая состояние почвы и прогноз погоды. <br />
                        Забудьте о ручных расчетах — доверьтесь автоматизации и <br />
                        сосредоточьтесь на качестве урожая.<br /> <br />
                    </p>
                    <p className="hero-cta">
                        Подробнее об использовании читайте{' '}
                        <Link to="/guide" className="hero-link">в руководстве</Link>.
                    </p>
                </div>
                <div className="hero-image">
                    <img src="/farmer.png" alt="Фермер с лейкой" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;