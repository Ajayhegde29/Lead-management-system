import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../constants/auth';
import { login as loginRequest } from '../services/authService';
import { AuthContext } from './authState';

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY));

  async function login(credentials) {
    const response = await loginRequest(credentials);
    const { token: accessToken, user: authenticatedUser } = response.data;

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    setToken(accessToken);
    setUser(authenticatedUser);
  }

  function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token && user), login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
