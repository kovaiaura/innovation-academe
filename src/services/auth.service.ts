import api from './api';
import { AuthResponse, User } from '@/types';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store token and user data
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.tenant) {
        localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
      }
    }
    
    return response.data;
  },

  // Logout
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if token is valid
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  // Get tenant info
  getTenant(): { id: string; name: string; slug: string } | null {
    const tenantStr = localStorage.getItem('tenant');
    if (!tenantStr) return null;
    
    try {
      return JSON.parse(tenantStr);
    } catch {
      return null;
    }
  }
};
