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
  position_id?: string; // Dynamic position reference
  position_name?: string; // Display name for position
  is_ceo?: boolean; // True for CEO position
  tenant_id?: string; // null for super_admin
  institution_id?: string;
  created_at: string;
  // Salary configuration (for meta staff and officers)
  hourly_rate?: number;
  overtime_rate_multiplier?: number;
  normal_working_hours?: number;
  // Password management
  password_changed?: boolean; // Has user changed their initial password?
  must_change_password?: boolean; // Force password change on next login
  password_changed_at?: string; // Timestamp of last password change
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
