import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
    isLoggedIn: boolean;
    user: any | null;
}

// Initialize state from localStorage if available
const getInitialState = (): AuthState => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        return {
            isLoggedIn: !!token,
            user: null,
        };
    }
    return {
        isLoggedIn: false,
        user: null,
    };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.isLoggedIn = true;
            state.user = action.payload || null;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;