import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ai_dev_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('ai_dev_token');
      if (storedToken) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
        } catch (e) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('ai_dev_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    localStorage.setItem('ai_dev_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const loginAsDemo = async () => {
    await login('alex.developer@example.com', 'password123');
  };

  const register = async (name: string, email: string, pass: string) => {
    const data = await authService.register(name, email, pass);
    localStorage.setItem('ai_dev_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('ai_dev_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
