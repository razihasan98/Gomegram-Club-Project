import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('swapnosiri_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('swapnosiri_admin_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('swapnosiri_admin_token'));
  });

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('swapnosiri_admin_token');
      if (savedToken) {
        try {
          const res = await api.get('/admin/user');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('swapnosiri_admin_user', JSON.stringify(res.data.user));
          }
        } catch {
          localStorage.removeItem('swapnosiri_admin_token');
          localStorage.removeItem('swapnosiri_admin_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('swapnosiri_admin_token', newToken);
    localStorage.setItem('swapnosiri_admin_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/admin/logout');
      }
    } catch {
      // Ignore error on logout
    } finally {
      localStorage.removeItem('swapnosiri_admin_token');
      localStorage.removeItem('swapnosiri_admin_user');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('swapnosiri_admin_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !isLoading && Boolean(token) && Boolean(user),
        isLoading,
        login,
        logout,
        updateUser,
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
