import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access') || null);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setUser({
        token,
        userType,
        name: localStorage.getItem('userName') || 'User',
      });
    }
  }, [token, userType]);

  const loginSuccess = (authData) => {
    localStorage.setItem('access', authData.accessToken);
    localStorage.setItem('refresh', authData.refreshToken);
    localStorage.setItem('userType', authData.userType);
    localStorage.setItem('userName', authData.name || 'User');
    localStorage.setItem('userId', authData.userId);

    setToken(authData.accessToken);
    setUserType(authData.userType);
    setUser({
      token: authData.accessToken,
      userType: authData.userType,
      name: authData.name,
      userId: authData.userId,
    });
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUserType(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, userType, loginSuccess, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
