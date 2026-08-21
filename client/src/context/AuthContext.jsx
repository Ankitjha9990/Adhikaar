import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUrl, readApiResponse } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'adhikaar_token';
const USER_KEY = 'adhikaar_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState(null);

  // On mount: restore token & verify it with the server
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      // Optimistically restore user from localStorage first
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setIsLoading(false);
        return;
      }

      // Then verify the token with the server in the background
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.ok) {
          const data = await readApiResponse(res, 'Could not verify your session.');
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else {
          // Token invalid/expired
          setUser(null);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch {
        // Network error — keep the optimistic restore, user is still "logged in"
      }

      setIsLoading(false);
    }

    restoreSession();
  }, []);

  /** Called after successful login or register */
  function _persist(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setShowLoginModal(false);
  }

  /** Calls POST /api/auth/login */
  async function login(email, password) {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readApiResponse(res, 'Login failed.');
    _persist(data.user, data.token);
    return data.user;
  }

  /** Calls POST /api/auth/register */
  async function register(name, email, password) {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await readApiResponse(res, 'Registration failed.');
    _persist(data.user, data.token);
    return data.user;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /** Refresh user data from server */
  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await readApiResponse(res, 'Could not refresh your profile.');
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    } catch { /* silent */ }
  }, []);

  function openLoginModal(redirectPath = null) {
    setLoginRedirectPath(redirectPath);
    setShowLoginModal(true);
  }

  function closeLoginModal() {
    setShowLoginModal(false);
    setLoginRedirectPath(null);
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
        loginRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
