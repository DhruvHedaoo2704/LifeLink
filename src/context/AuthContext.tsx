import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import api from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('lifelink_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, userType: 'donor' | 'recipient') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const loggedInUser = {
        ...res.data.user,
        isDonor: res.data.user.userType === 'donor',
        isRecipient: res.data.user.userType === 'recipient',
      };
      setUser(loggedInUser);
      localStorage.setItem('lifelink_token', res.data.token);
      localStorage.setItem('lifelink_user', JSON.stringify(loggedInUser));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Invalid credentials');
    }
  };

  const googleLogin = async (googleToken: string, userType: 'donor' | 'recipient' = 'donor') => {
    try {
      const res = await api.post('/auth/google-login', { googleToken, userType });
      const loggedInUser = {
        ...res.data.user,
        isDonor: res.data.user.userType === 'donor',
        isRecipient: res.data.user.userType === 'recipient',
      };
      setUser(loggedInUser);
      localStorage.setItem('lifelink_token', res.data.token);
      localStorage.setItem('lifelink_user', JSON.stringify(loggedInUser));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Google login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const registeredUser = {
        ...res.data.user,
        isDonor: res.data.user.userType === 'donor',
        isRecipient: res.data.user.userType === 'recipient',
      };
      setUser(registeredUser);
      localStorage.setItem('lifelink_token', res.data.token);
      localStorage.setItem('lifelink_user', JSON.stringify(registeredUser));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser as User);
      localStorage.setItem('lifelink_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};