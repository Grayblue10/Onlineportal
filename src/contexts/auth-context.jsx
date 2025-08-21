import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshAuth: async () => {}
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      setUser(null);
      setToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshAuth();
      } catch (error) {
        console.error('Failed to load user:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to ensure the token is properly set
    const timer = setTimeout(() => {
      loadUser();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [token, refreshAuth]);

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const { user, token } = await authService.login(credentials);
      setToken(token);
      setUser(user);
      return { user, token };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const { user, token } = await authService.register(userData);
      setToken(token);
      setUser(user);
      return { user, token };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout().finally(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isTeacher: user?.role === 'teacher',
      isStudent: user?.role === 'student',
      login,
      register,
      logout,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };