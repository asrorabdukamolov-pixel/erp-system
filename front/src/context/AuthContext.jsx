import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('erp_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Auth check failed", err);
          localStorage.removeItem('erp_token');
          localStorage.removeItem('erp_user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (loginValue, password) => {
    try {
      const res = await api.post('/auth/login', { login: loginValue, password });
      const { token, user: userObj } = res.data;
      
      localStorage.setItem('erp_token', token);
      localStorage.setItem('erp_user', JSON.stringify(userObj));
      setUser(userObj);
      
      return { success: true, user: userObj };
    } catch (err) {
      console.error("Login error", err);
      const message = err.response?.data?.msg || 'Login yoki parol noto\'g\'ri';
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  const updateUser = async (newData) => {
    // In a real app, this would also call a backend API
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('erp_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
