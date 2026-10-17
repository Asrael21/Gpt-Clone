import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3777/api' : '/api');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('gpt_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('gpt_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Configure axios authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('gpt_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('gpt_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gpt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gpt_user');
    }
  }, [user]);

  // Verify session on mount if token exists
  useEffect(() => {
    async function verifySession() {
      if (!token) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.data.user) {
          setUser(response.data.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        logout();
      }
    }
    verifySession();
  }, []);

  const openLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (identifier, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      identifier,
      password,
    });

    if (response.data.success) {
      const { user: loggedInUser, token: authToken } = response.data.data;
      setUser(loggedInUser);
      setToken(authToken);
      setIsAuthModalOpen(false);
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const register = async (username, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
    });

    if (response.data.success) {
      const { user: registeredUser, token: authToken } = response.data.data;
      setUser(registeredUser);
      setToken(authToken);
      setIsAuthModalOpen(false);
      return response.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gpt_token');
    localStorage.removeItem('gpt_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openLogin,
        openSignup,
        closeAuthModal,
        login,
        register,
        logout,
        API_BASE_URL,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
