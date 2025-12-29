"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getFingerprint } from "bro-auth/browser";
import logger from '../utils/logger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const setToken = (token) => setAccessToken(token);
  const clearToken = () => setAccessToken(null);

  const refreshAccessToken = useCallback(async () => {
    try {
      const fp = await getFingerprint();
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ fingerprint: fp.hash }),
      });

      if (!res.ok) {
        // If 401/400, session is just invalid/expired. No need to log error.
        if (res.status === 401 || res.status === 400) {
          clearToken();
          return null;
        }
        throw new Error(`Refresh failed: ${res.status}`);
      }

      const data = await res.json();
      if (!data.accessToken) throw new Error('No token returned');

      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      logger.error("Refresh error (unexpected)", err);
      clearToken();
      return null;
    }
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const fp = await getFingerprint();
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-fingerprint': fp.hash,
    };

    // Use current state token if available
    // Note: In a closure, this might be stale, but we can try relying on the prop or just accept valid cases.
    // Ideally we'd use a ref for the token to always get current, but let's trust the consumer to pass it or use state.
    // ACTUALLY: We have accessToken in scope.
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      // Token might be expired, try refresh
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      }
    }

    return res;
  }, [accessToken, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setToken, clearToken, refreshAccessToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
