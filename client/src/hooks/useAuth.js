// client/src/hooks/useAuth.js
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { getToken, setToken, removeToken } from '../utils/authToken';

export function useAuth() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(
        async (loginValue, password) => {
            setLoading(true);
            setError(null);
            try {
                const { token } = await authApi.login(loginValue, password);
                setToken(token);
                localStorage.setItem('username', loginValue);
                navigate('/home');
                return token;
            } catch (e) {
                setError(e.message);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    const logout = useCallback(() => {
        removeToken();
        localStorage.removeItem('username');
        navigate('/login');
    }, [navigate]);

    const isAuthenticated = !!getToken();

    return { login, logout, isAuthenticated, loading, error };
}