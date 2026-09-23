import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../data/types';

const STORAGE_KEY = 'lifesaver-session';

const DEMO_ACCOUNTS: Record<string, { pin: string; user: AuthUser }> = {
  'DOC-1001': {
    pin: '1234',
    user: {
      id: 'DOC-1001',
      name: 'Dr. Anand S.',
      role: 'Doctor',
      designation: 'Senior Blood Bank Officer',
    },
  },
  'STAFF-2001': {
    pin: '5678',
    user: {
      id: 'STAFF-2001',
      name: 'Kavitha R.',
      role: 'Staff',
      designation: 'Blood Bank Technician',
    },
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  login: (staffId: string, pin: string, remember: boolean) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readSession);

  const login = useCallback((staffId: string, pin: string, remember: boolean) => {
    const account = DEMO_ACCOUNTS[staffId.trim().toUpperCase()];
    if (!account || account.pin !== pin.trim()) return false;
    setUser(account.user);
    try {
      const raw = JSON.stringify(account.user);
      if (remember) {
        localStorage.setItem(STORAGE_KEY, raw);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
