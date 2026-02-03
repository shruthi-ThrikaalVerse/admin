import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'auditor';
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, role: 'admin' | 'manager' | 'auditor', password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'HRMS_AUTH_SESSION_V1';
const USERS_STORAGE_KEY = 'HRMS_REGISTERED_USERS_V1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password);

    if (email === 'admin@hrms.com' && password === 'admin123') {
      const defaultUser: User = {
        id: '1',
        fullName: 'Super Admin',
        email: 'admin@hrms.com',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      };
      setUser(defaultUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser));
      return;
    }

    if (foundUser) {
      const { password: _, ...userWithoutPass } = foundUser;
      setUser(userWithoutPass);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPass));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (name: string, email: string, role: 'admin' | 'manager', password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    if (registeredUsers.some((u: any) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      fullName: name,
      email,
      role,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...registeredUsers, newUser]));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return;
    const updatedUser = { ...user, avatar: avatarUrl };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
