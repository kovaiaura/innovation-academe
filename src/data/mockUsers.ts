import { User, AuthResponse } from '@/types';

export interface MockUser extends User {
  password: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@metainnova.com',
    password: 'admin123',
    name: 'Super Admin',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'student@college.edu',
    password: 'student123',
    name: 'John Student',
    role: 'student',
    tenant_id: 'college-1',
    institution_id: 'inst-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnStudent',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'officer@college.edu',
    password: 'officer123',
    name: 'Innovation Officer',
    role: 'officer',
    tenant_id: 'college-1',
    institution_id: 'inst-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Officer',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'teacher@college.edu',
    password: 'teacher123',
    name: 'Dr. Sarah Teacher',
    role: 'teacher',
    tenant_id: 'college-1',
    institution_id: 'inst-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'admin@college.edu',
    password: 'admin123',
    name: 'Institution Admin',
    role: 'institution_admin',
    tenant_id: 'college-1',
    institution_id: 'inst-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=InstAdmin',
    created_at: new Date().toISOString(),
  },
];

export const mockTenants = [
  {
    id: 'college-1',
    name: 'Springfield College',
    slug: 'springfield',
  },
];

export const mockAuthService = {
  login: (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (!user) {
          reject({
            response: {
              data: {
                message: 'Invalid email or password',
              },
            },
          });
          return;
        }

        const { password: _, ...userWithoutPassword } = user;
        const tenant = user.tenant_id 
          ? mockTenants.find(t => t.id === user.tenant_id)
          : undefined;

        resolve({
          success: true,
          token: `mock-jwt-token-${user.id}`,
          user: userWithoutPassword,
          tenant,
        });
      }, 500); // Simulate network delay
    });
  },
};
