import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import UserStore from './store/UserStore';

export const Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Context.Provider
            value={{
                user: new UserStore()
            }}
        >
            <App />
        </Context.Provider>
    </React.StrictMode>
);

reportWebVitals();