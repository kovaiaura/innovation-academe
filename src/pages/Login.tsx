import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { getRoleDashboardPath } from '@/utils/roleHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      if (response.success) {
        login(response.user, response.token);
        toast.success(`Welcome back, ${response.user.name}!`);
        
        // Get tenant slug for path-based routing
        const tenantSlug = response.tenant?.slug;
        
        // Redirect based on role
        const dashboardPath = getRoleDashboardPath(response.user.role, tenantSlug);
        const from = location.state?.from?.pathname || dashboardPath;
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-meta-dark via-meta-dark-lighter to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-meta-dark">
            <span className="text-3xl font-bold text-meta-accent">MI</span>
          </div>
          <CardTitle className="text-2xl font-bold">Meta-INNOVA LMS</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
          <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-xs">
            <p className="font-semibold mb-2">Mock Credentials:</p>
            <div className="space-y-1 text-muted-foreground">
              <p>Super Admin: <code>admin@metainnova.com</code> / <code>admin123</code></p>
              <p>Student: <code>student@college.edu</code> / <code>student123</code></p>
              <p>Officer: <code>officer@college.edu</code> / <code>officer123</code></p>
              <p>Teacher: <code>teacher@college.edu</code> / <code>teacher123</code></p>
              <p>Inst. Admin: <code>admin@college.edu</code> / <code>admin123</code></p>
              <p>System Admin: <code>system@metainnova.com</code> / <code>system123</code></p>
              <p>Management: <code>management@college.edu</code> / <code>management123</code></p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-meta-dark hover:bg-meta-dark-lighter"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
