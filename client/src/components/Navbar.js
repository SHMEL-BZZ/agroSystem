import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

/*
NavLink - это специальная ссылка, которая знает, активна ли она сейчас. 
Он сам добавляет класс (например, active), чтобы подсветить текущую страницу в меню.
*/

const Navbar = () => {
    return (
        <div className="navbar-wrapper">
            <nav className="navbar">
                <NavLink to="/home" className="nav-item">Главная</NavLink>
                <NavLink to="/guide" className="nav-item">Руководство</NavLink>
                <NavLink to="/watering" className="nav-item">Полив</NavLink>
                <NavLink to="/solutions" className="nav-item">Растворы</NavLink>
                <NavLink to="/charts" className="nav-item">Графики</NavLink>
                <NavLink to="/valves" className="nav-item">Клапаны</NavLink>
                <NavLink to="/data" className="nav-item">Сбор данных</NavLink>
            </nav>
        </div>
    );
};

export default Navbar;