export const tokenStorage = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    setAccessToken: (token: string) => localStorage.setItem('accessToken', token),
    clearAccessToken: () => localStorage.removeItem('accessToken'),
};