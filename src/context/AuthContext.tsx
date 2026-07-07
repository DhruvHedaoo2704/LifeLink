import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType, RegisterData, User } from '../types';
import { useAuthStore } from '../store/authStore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login: storeLogin, register: storeRegister, logout: storeLogout, updateProfile, fetchProfile, isAuthenticated } = useAuthStore();

  // On mount, load profile if session is active
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().catch(console.error);
    }
  }, [isAuthenticated, fetchProfile]);

  const login = async (email: string, password: string, userType: 'donor' | 'recipient') => {
    // Both email and mobile are handled by the single identifier login endpoint
    await storeLogin(email, password);
  };

  const googleLogin = async (token: string) => {
    const { googleLogin: storeGoogleLogin } = useAuthStore.getState();
    await storeGoogleLogin(token);
  };

  const register = async (userData: RegisterData) => {
    await storeRegister(userData);
  };

  const logout = () => {
    storeLogout().catch(console.error);
  };

  const updateUser = (userData: Partial<User>) => {
    updateProfile(userData).catch(console.error);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, googleLogin, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};