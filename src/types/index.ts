// User Role Enum
export type UserRole = 
  | 'super_admin'
  | 'system_admin'
  | 'management'
  | 'officer'
  | 'teacher'
  | 'student';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  tenant_id?: string; // null for super_admin
  institution_id?: string;
  created_at: string;
}

// Auth Response
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  tenant?: {
    id: string;
    name: string;
    slug: string; // for URL path
  };
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
