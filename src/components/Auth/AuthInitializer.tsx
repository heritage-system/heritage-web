'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { login, logout } from '@/redux/slice/authSlice';

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            dispatch(login(null));
        } else {
            dispatch(logout());
        }
    }, [dispatch]);

    return <>{children}</>;
};

export default AuthInitializer;
