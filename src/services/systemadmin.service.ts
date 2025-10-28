import api from './api';
import { ApiResponse } from '@/types';

// Tenant interfaces
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  subscription_status: 'active' | 'inactive';
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  total_users: number;
  total_institutions: number;
  storage_used_gb: number;
  created_at: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  logo?: string;
  subscription_plan: string;
  admin_email: string;
  admin_name: string;
  admin_password: string;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'university' | 'college' | 'school' | 'institute';
  location: string;
  established_year: number;
  total_students: number;
  total_faculty: number;
  status: 'active' | 'inactive' | 'suspended';
  license_type: 'basic' | 'standard' | 'premium' | 'enterprise';
  license_expiry: string;
  contact_email: string;
  contact_phone: string;
  admin_name: string;
  admin_email: string;
}

export interface SystemReport {
  id: string;
  title: string;
  type: 'usage' | 'performance' | 'financial' | 'compliance';
  period: string;
  generated_date: string;
  institutions_count: number;
  file_url?: string;
}

export interface LicenseInfo {
  id: string;
  institution_id: string;
  institution_name: string;
  license_type: 'basic' | 'standard' | 'premium' | 'enterprise';
  start_date: string;
  expiry_date: string;
  max_users: number;
  current_users: number;
  status: 'active' | 'expired' | 'expiring_soon';
  features: string[];
}

export interface SystemMetrics {
  total_institutions: number;
  total_users: number;
  total_students: number;
  total_faculty: number;
  active_licenses: number;
  expiring_licenses: number;
  revenue_this_month: number;
  system_uptime: number;
}

export const systemAdminService = {
  // Tenant Management (moved from Super Admin)
  async getTenants(params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{ tenants: Tenant[]; pagination: any }>> {
    const response = await api.get('/system-admin/tenants', { params });
    return response.data;
  },

  async createTenant(data: CreateTenantRequest): Promise<ApiResponse<any>> {
    const response = await api.post('/system-admin/tenants', data);
    return response.data;
  },

  async updateTenant(id: string, data: Partial<Tenant>): Promise<ApiResponse<any>> {
    const response = await api.put(`/system-admin/tenants/${id}`, data);
    return response.data;
  },

  async deleteTenant(id: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/system-admin/tenants/${id}`);
    return response.data;
  },

  // Institutions
  async getInstitutions(): Promise<ApiResponse<Institution[]>> {
    const response = await api.get('/system-admin/institutions');
    return response.data;
  },

  async addInstitution(institution: Partial<Institution>): Promise<ApiResponse<Institution>> {
    const response = await api.post('/system-admin/institutions', institution);
    return response.data;
  },

  async updateInstitution(id: string, institution: Partial<Institution>): Promise<ApiResponse<Institution>> {
    const response = await api.put(`/system-admin/institutions/${id}`, institution);
    return response.data;
  },

  async deleteInstitution(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/institutions/${id}`);
    return response.data;
  },

  async suspendInstitution(id: string, reason: string): Promise<ApiResponse<Institution>> {
    const response = await api.post(`/system-admin/institutions/${id}/suspend`, { reason });
    return response.data;
  },

  async activateInstitution(id: string): Promise<ApiResponse<Institution>> {
    const response = await api.post(`/system-admin/institutions/${id}/activate`);
    return response.data;
  },

  // Licenses
  async getLicenses(): Promise<ApiResponse<LicenseInfo[]>> {
    const response = await api.get('/system-admin/licenses');
    return response.data;
  },

  async updateLicense(id: string, license: Partial<LicenseInfo>): Promise<ApiResponse<LicenseInfo>> {
    const response = await api.put(`/system-admin/licenses/${id}`, license);
    return response.data;
  },

  async renewLicense(id: string, duration: number): Promise<ApiResponse<LicenseInfo>> {
    const response = await api.post(`/system-admin/licenses/${id}/renew`, { duration });
    return response.data;
  },

  // Reports
  async getSystemReports(): Promise<ApiResponse<SystemReport[]>> {
    const response = await api.get('/system-admin/reports');
    return response.data;
  },

  async generateReport(type: string, period: string): Promise<ApiResponse<SystemReport>> {
    const response = await api.post('/system-admin/reports/generate', { type, period });
    return response.data;
  },

  // Dashboard Metrics
  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    const response = await api.get('/system-admin/metrics');
    return response.data;
  },

  // Institution Analytics
  async getInstitutionAnalytics(institutionId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/system-admin/institutions/${institutionId}/analytics`);
    return response.data;
  },
};
