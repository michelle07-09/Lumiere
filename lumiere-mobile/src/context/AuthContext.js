import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from './config';

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': CONFIG.SUPABASE_ANON_KEY,
};

// ── Raw API calls ────────────────────────────────────────────────────────────
async function apiSignUp(email, password, fullName) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST', headers: BASE_HEADERS,
    body: JSON.stringify({ email, password, data: { full_name: fullName } }),
  });
  return res.json();
}

async function apiSignIn(email, password) {
  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: BASE_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function apiSignOut(accessToken) {
  await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { ...BASE_HEADERS, Authorization: `Bearer ${accessToken}` },
  });
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [session,   setSession]   = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('lumiere_session');
        if (raw) {
          const sess = JSON.parse(raw);
          if (!sess.expires_at || Date.now() / 1000 < sess.expires_at) {
            setSession(sess);
            setUser(sess.user);
          } else {
            await AsyncStorage.removeItem('lumiere_session');
          }
        }
      } catch {}
      setAuthReady(true);
    })();
  }, []);

  const _persist = async (sess) => {
    await AsyncStorage.setItem('lumiere_session', JSON.stringify(sess));
    setSession(sess);
    setUser(sess.user);
  };

  const signIn = async (email, password) => {
    const data = await apiSignIn(email, password);
    if (data.error || data.error_code) {
      throw new Error(data.error_description || data.msg || 'Login failed');
    }
    await _persist({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      user:          data.user,
    });
    return data;
  };

  const signUp = async (email, password, fullName) => {
    const data = await apiSignUp(email, password, fullName);
    if (data.error || data.error_code) {
      throw new Error(data.error_description || data.msg || 'Signup failed');
    }
    if (data.access_token) {
      await _persist({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        expires_at:    data.expires_at,
        user:          data.user,
      });
    }
    return data;
  };

  const signOut = async () => {
    try {
      if (session?.access_token) await apiSignOut(session.access_token);
    } catch {}
    await AsyncStorage.removeItem('lumiere_session');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, session, authReady, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}