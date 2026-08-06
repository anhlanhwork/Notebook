import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../firebase.js';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

/* TODO(demo): luồng Firebase đang bị tắt tạm để demo nhanh không cần đăng nhập
   Google thật. Đổi lại thành false để bật lại đăng nhập Google bình thường. */
const DEMO_MODE = true;
const DEMO_USER = { uid: 'demo', displayName: 'Demo', email: 'demo@local', photoURL: null, isDemo: true };

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(undefined);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null);
    });
  }, []);

  async function signInGoogle() {
    setAuthError(null);
    if (DEMO_MODE) {
      setUser(DEMO_USER);
      return;
    }
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      if (e.code === 'auth/popup-closed-by-user') return;
      console.error('Auth error:', e.code, e.message);
      setAuthError(e.code);
    }
  }

  function logout() {
    if (user?.isDemo) { setUser(null); return; }
    return signOut(auth);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading: user === undefined,
      authError,
      signInGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
