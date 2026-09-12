import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

// Master Exhibitor Authorization Codes for Theatre Partner Onboarding
export const VALID_THEATRE_CODES = [
  'CINE-THEATRE-2026',
  'THEATRE2026',
  'CINEPARTNER2026',
  'EXHIBITOR2026',
  '2026'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinebook_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cinebook_token') || null;
  });

  // Automatically purge legacy mock tokens or deleted demo sessions from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('cinebook_token');
    const savedUserStr = localStorage.getItem('cinebook_user');
    if (savedToken && savedToken.startsWith('jwt_')) {
      console.info('Clearing legacy mock session token...');
      localStorage.removeItem('cinebook_user');
      localStorage.removeItem('cinebook_token');
      setUser(null);
      setToken(null);
    } else if (
      savedUserStr &&
      (savedUserStr.includes('aarav.sharma@example.com') || savedUserStr.includes('partner@sivacinemas.com'))
    ) {
      console.info('Clearing legacy wiped demo user session...');
      localStorage.removeItem('cinebook_user');
      localStorage.removeItem('cinebook_token');
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = async (email, password, role = 'CUSTOMER') => {
    if (!email || !password) {
      throw new Error('Please fill in both email and password.');
    }

    const data = await authApi.login(email.trim().toLowerCase(), password);
    if (!data?.access_token || !data?.user) {
      throw new Error('Authentication failed: No valid token received from server.');
    }

    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem('cinebook_user', JSON.stringify(data.user));
    localStorage.setItem('cinebook_token', data.access_token);
    return data.user;
  };

  const register = async (userData) => {
    const isTheatreAdmin = userData.role === 'THEATRE_ADMIN';
    
    if (isTheatreAdmin) {
      // Validate Theatre Secret Code
      const enteredCode = (userData.theatreSecretCode || '').trim();
      const isValid = VALID_THEATRE_CODES.includes(enteredCode);
      if (!isValid) {
        throw new Error('Invalid Theatre Partner Authorization Code! Please enter the official code provided by CineBook Admin.');
      }
    }

    const payload = {
      name: (userData.name || '').trim(),
      email: (userData.email || '').trim().toLowerCase(),
      phone: (userData.phone || '').trim() || null,
      password: userData.password,
      role: userData.role || (isTheatreAdmin ? 'THEATRE_ADMIN' : 'CUSTOMER')
    };

    const data = await authApi.register(payload);
    if (!data?.access_token || !data?.user) {
      throw new Error('Registration failed: No valid session received from server.');
    }

    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem('cinebook_user', JSON.stringify(data.user));
    localStorage.setItem('cinebook_token', data.access_token);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cinebook_user');
    localStorage.removeItem('cinebook_token');
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
        role: user?.role || 'GUEST',
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
        isTheatreAdmin: user?.role === 'THEATRE_ADMIN',
        isCustomer: user?.role === 'CUSTOMER',
        login,
        register,
        setUserAndToken,
        logout
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
