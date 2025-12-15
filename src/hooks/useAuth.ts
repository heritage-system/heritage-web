import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('accessToken');
    const storedName = localStorage.getItem('userName');
    const storedAvatar = localStorage.getItem('avatarUrl');
    const storeType = localStorage.getItem('userType');

    setIsLoggedIn(!!token);
    setUserName(storedName);
    setAvatarUrl(storedAvatar);
    setUserType(storeType)
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (['accessToken', 'userName', 'avatarUrl', 'userType'].includes(e.key ?? '')) {
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

  const login = (userData?: any) => { setIsLoggedIn(true); window.dispatchEvent(new CustomEvent('authChange')); };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    localStorage.removeItem('avatarUrl');
    setIsLoggedIn(false);
    setUserName(null);
    setAvatarUrl(null);
    setUserType(null);
    window.dispatchEvent(new CustomEvent('authChange'));
  };

  return {
    isLoggedIn,
    loading,
    userName,
    avatarUrl,
    userType,
    login,
    logout,
    checkAuthStatus,
  };
};
