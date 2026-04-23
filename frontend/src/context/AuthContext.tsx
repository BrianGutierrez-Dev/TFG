import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Employee } from '../types';
import api from '../api/axios';

interface AuthContextValue {
  employee: Employee | null;
  token: string | null;
  login: (token: string, employee: Employee) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): { token: string | null; employee: Employee | null } {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('employee');
    const employee = raw ? (JSON.parse(raw) as Employee) : null;
    return { token, employee };
  } catch {
    return { token: null, employee: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadFromStorage();
  const [token, setToken] = useState<string | null>(initial.token);
  const [employee, setEmployee] = useState<Employee | null>(initial.employee);

  useEffect(() => {
    if (initial.token) {
      api.get('/auth/me').catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        setToken(null);
        setEmployee(null);
      });
    }
  // Solo al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback((newToken: string, newEmployee: Employee) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('employee', JSON.stringify(newEmployee));
    setToken(newToken);
    setEmployee(newEmployee);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setToken(null);
    setEmployee(null);
  }, []);

  return (
    <AuthContext.Provider value={{ employee, token, login, logout, isAdmin: employee?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
