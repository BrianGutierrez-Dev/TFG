import api from './axios';
import type { Employee } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; employee: Employee }>('/auth/login', { email, password }),
  me: () => api.get<Employee>('/auth/me'),
};
