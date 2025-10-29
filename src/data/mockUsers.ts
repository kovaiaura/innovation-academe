import { User, AuthResponse } from '@/types';

export interface MockUser extends User {
  password: string;
}

// Create a properly formatted mock JWT token that can be decoded
const createMockJWT = (userId: string, role: string, tenantId?: string) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    role: role,
    tenant_id: tenantId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

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
    name: 'Management Admin',
    role: 'management',
    tenant_id: 'college-1',
    institution_id: 'inst-1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=InstAdmin',
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    email: 'system@metainnova.com',
    password: 'system123',
    name: 'System Admin',
    role: 'system_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SystemAdmin',
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
          token: createMockJWT(user.id, user.role, user.tenant_id),
          user: userWithoutPassword,
          tenant,
        });
      }, 500); // Simulate network delay
    });
  },
};
