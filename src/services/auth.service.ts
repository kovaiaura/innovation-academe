import api from './api';
import { AuthResponse, User } from '@/types';
import { jwtDecode } from 'jwt-decode';
import { mockAuthService } from '@/data/mockUsers';

export interface LoginCredentials {
  email: string;
  password: string;
}

// Toggle this to switch between mock and real API
const USE_MOCK_AUTH = true;

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    let response: AuthResponse;

    if (USE_MOCK_AUTH) {
      // Use mock authentication
      response = await mockAuthService.login(credentials.email, credentials.password);
    } else {
      // Use real API
      const apiResponse = await api.post<AuthResponse>('/auth/login', credentials);
      response = apiResponse.data;
    }
    
    // Store token and user data
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (response.tenant) {
        localStorage.setItem('tenant', JSON.stringify(response.tenant));
      }
    }
    
    return response;
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
    } catch (error) {
      // If decode fails in mock mode, still consider authenticated if token exists
      if (USE_MOCK_AUTH) {
        console.warn('Mock token decode failed, but allowing authentication in mock mode');
        return true;
      }
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
