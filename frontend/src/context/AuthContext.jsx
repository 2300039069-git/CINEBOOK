import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

const MOCK_USERS = {
  customer: {
    id: 'usr-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
  },
  theatre_admin: {
    id: 'usr-002',
    name: 'Rajesh Malhotra',
    email: 'theatre@phoenixcinemas.com',
    phone: '+91 98111 22334',
    role: 'THEATRE_ADMIN',
    theatreId: 'th-001',
    theatreName: 'CineBook Grand Cinema — Phoenix Mall',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop'
  },
  super_admin: {
    id: 'usr-admin-dhanush',
    name: 'Dhanush Kancharla',
    email: 'kancharladhanush2003@gmail.com',
    phone: '+91 98765 00001',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cinebook_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cinebook_token') || null;
  });

  const login = async (email, password, role = 'CUSTOMER') => {
    try {
      const data = await authApi.login(email, password);
      if (data?.access_token && data?.user) {
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('cinebook_user', JSON.stringify(data.user));
        localStorage.setItem('cinebook_token', data.access_token);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend login fallback:', err.message);
    }

    // Demo/Fallback login
    let loggedInUser;
    if (
      role === 'SUPER_ADMIN' ||
      email.includes('kancharladhanush2003@gmail.com') ||
      email.includes('admin@cinebook')
    ) {
      loggedInUser = MOCK_USERS.super_admin;
    } else if (role === 'THEATRE_ADMIN' || email.includes('theatre') || email.includes('phoenix')) {
      loggedInUser = MOCK_USERS.theatre_admin;
    } else {
      loggedInUser = {
        ...MOCK_USERS.customer,
        email: email || MOCK_USERS.customer.email,
        name: email ? email.split('@')[0].toUpperCase() : MOCK_USERS.customer.name
      };
    }

    const mockToken = `jwt_${btoa(JSON.stringify({ id: loggedInUser.id, role: loggedInUser.role, exp: Date.now() + 86400000 }))}`;
    
    setUser(loggedInUser);
    setToken(mockToken);
    localStorage.setItem('cinebook_user', JSON.stringify(loggedInUser));
    localStorage.setItem('cinebook_token', mockToken);
    return loggedInUser;
  };

  const register = async (userData) => {
    try {
      const data = await authApi.register(userData);
      if (data?.access_token && data?.user) {
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('cinebook_user', JSON.stringify(data.user));
        localStorage.setItem('cinebook_token', data.access_token);
        return data.user;
      }
    } catch (err) {
      console.warn('Backend register fallback:', err.message);
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
    };

    const mockToken = `jwt_${btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }))}`;
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem('cinebook_user', JSON.stringify(newUser));
    localStorage.setItem('cinebook_token', mockToken);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cinebook_user');
    localStorage.removeItem('cinebook_token');
  };

  const switchRoleForDemo = (roleKey) => {
    if (MOCK_USERS[roleKey]) {
      const selected = MOCK_USERS[roleKey];
      setUser(selected);
      const mockToken = `jwt_${btoa(JSON.stringify({ id: selected.id, role: selected.role }))}`;
      setToken(mockToken);
      localStorage.setItem('cinebook_user', JSON.stringify(selected));
      localStorage.setItem('cinebook_token', mockToken);
    }
  };

  const setUserAndToken = (newUser, newToken) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser) {
      localStorage.setItem('cinebook_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('cinebook_user');
    }
    if (newToken) {
      localStorage.setItem('cinebook_token', newToken);
    } else {
      localStorage.removeItem('cinebook_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        isTheatreAdmin: user?.role === 'THEATRE_ADMIN',
        isCustomer: user?.role === 'CUSTOMER',
        login,
        register,
        setUserAndToken,
        logout,
        switchRoleForDemo
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
