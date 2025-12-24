import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            await fetchAndSetUser(session.user.id);
          }, 0);
        } else {
          setUser(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchAndSetUser(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAndSetUser = async (userId: string) => {
    try {
      // Fetch ALL user roles (for multi-role support)
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        const roles: UserRole[] = rolesData?.map(r => r.role as UserRole) || ['student'];
        // Primary role: prefer system_admin for CEO, otherwise use first role
        const role: UserRole = roles.includes('system_admin') ? 'system_admin' : roles[0];
        
        // Fetch tenant info if user has institution_id and it's not already in localStorage
        let tenantSlug: string | undefined;
        if (profileData.institution_id) {
          const existingTenant = localStorage.getItem('tenant');
          if (existingTenant) {
            try {
              const parsed = JSON.parse(existingTenant);
              tenantSlug = parsed.slug;
            } catch {}
          }
          
          if (!tenantSlug) {
            const { data: institutionData } = await supabase
              .from('institutions')
              .select('id, name, slug')
              .eq('id', profileData.institution_id)
              .maybeSingle();
            
            if (institutionData) {
              tenantSlug = institutionData.slug;
              localStorage.setItem('tenant', JSON.stringify({
                id: institutionData.id,
                name: institutionData.name,
                slug: institutionData.slug,
              }));
            }
          }
        }
        
        const userData: User = {
          id: userId,
          email: profileData.email,
          name: profileData.name,
          avatar: profileData.avatar || undefined,
          role,
          roles, // Include all roles
          position_id: profileData.position_id || undefined,
          position_name: profileData.position_name || undefined,
          is_ceo: profileData.is_ceo || false,
          institution_id: profileData.institution_id || undefined,
          tenant_id: profileData.institution_id || undefined, // Add tenant_id for sidebar routing
          class_id: profileData.class_id || undefined,
          created_at: profileData.created_at || '',
          hourly_rate: profileData.hourly_rate || undefined,
          overtime_rate_multiplier: profileData.overtime_rate_multiplier || undefined,
          normal_working_hours: profileData.normal_working_hours || undefined,
          password_changed: profileData.password_changed || false,
          must_change_password: profileData.must_change_password || false,
          password_changed_at: profileData.password_changed_at || undefined,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
