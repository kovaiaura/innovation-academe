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
import loginBg from '@/assets/login-background.svg';
import logoImage from '@/assets/logo.png';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login
  } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login({
        email,
        password
      });
      if (response.success) {
        login(response.user, response.token);
        toast.success(`Welcome back, ${response.user.name}!`);

        // Get tenant slug for path-based routing
        const tenantSlug = response.tenant?.slug;

        // Redirect based on role
        const dashboardPath = getRoleDashboardPath(response.user.role, tenantSlug);
        const from = location.state?.from?.pathname || dashboardPath;
        navigate(from, {
          replace: true
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };
  return <div 
      className="flex min-h-screen items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(5, 28, 45, 0.85), rgba(5, 28, 45, 0.95)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full overflow-hidden" style={{ backgroundColor: '#051c2d' }}>
            <img src={logoImage} alt="CR Logo" className="h-full w-full object-contain p-2" />
          </div>
          <CardTitle className="text-2xl font-bold">Meta-INNOVA LMS</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full bg-meta-dark hover:bg-meta-dark-lighter" disabled={isLoading}>
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
}