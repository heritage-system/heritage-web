import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('accessToken');
        setIsLoggedIn(!!token);
        setLoading(false);
    };

    useEffect(() => {
        checkAuthStatus();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'accessToken') {
                checkAuthStatus();
            }
        };

        const handleAuthChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    const login = (userData?: any) => {
        setIsLoggedIn(true);
        window.dispatchEvent(new CustomEvent('authChange'));
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        window.dispatchEvent(new CustomEvent('authChange'));
    };

    return {
        isLoggedIn,
        loading,
        login,
        logout,
        checkAuthStatus
    };
};
