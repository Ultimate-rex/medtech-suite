import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Hospital, Lock, User, Stethoscope, FlaskConical, CreditCard, CalendarCheck, Shield } from 'lucide-react';
import { useHospitalSettings } from '@/hooks/useHospitalSettings';
import { supabase } from '@/integrations/supabase/client';

type LoginRole = 'admin' | 'doctor' | 'lab_staff' | 'billing_staff' | 'appointment_staff' | null;

const roleConfig = {
  admin: { icon: Shield, label: 'Admin', color: 'bg-primary', redirect: '/admin' },
  doctor: { icon: Stethoscope, label: 'Doctor', color: 'bg-blue-500', redirect: '/doctor-panel' },
  lab_staff: { icon: FlaskConical, label: 'Lab Staff', color: 'bg-green-500', redirect: '/lab-panel' },
  billing_staff: { icon: CreditCard, label: 'Billing', color: 'bg-amber-500', redirect: '/billing-panel' },
  appointment_staff: { icon: CalendarCheck, label: 'Appointments', color: 'bg-purple-500', redirect: '/appointment-panel' },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(true);
  const [selectedRole, setSelectedRole] = useState<LoginRole>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { settings } = useHospitalSettings();

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role: LoginRole) => {
    setSelectedRole(role);
    setShowRoleDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    if (!selectedRole) {
      toast.error('Please select a login type');
      setShowRoleDialog(true);
      return;
    }

    setIsLoading(true);

    if (selectedRole === 'admin') {
      // Admin login through existing auth
      const result = await login(username, password);
      setIsLoading(false);

      if (result.success) {
        toast.success('Login successful!');
        navigate('/admin');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } else {
      // Staff login - check staff_users table
      try {
        const { data: staffUser, error } = await supabase
          .from('staff_users')
          .select('*')
          .eq('username', username)
          .eq('role', selectedRole)
          .eq('is_active', true)
          .single();

        if (error || !staffUser) {
          toast.error('Invalid credentials or account not active');
          setIsLoading(false);
          return;
        }

        // Simple password check (in production, use proper hashing)
        if (staffUser.password_hash !== password) {
          toast.error('Invalid password');
          setIsLoading(false);
          return;
        }

        // Store staff session
        localStorage.setItem('staff_user', JSON.stringify(staffUser));
        localStorage.setItem('staff_role', selectedRole);
        
        toast.success(`Welcome, ${staffUser.name}!`);
        navigate(roleConfig[selectedRole].redirect);
      } catch (err) {
        console.error('Staff login error:', err);
        toast.error('Login failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const RoleIcon = selectedRole ? roleConfig[selectedRole].icon : Hospital;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Hospital Logo" className="w-16 h-16 rounded-lg object-contain" />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Hospital className="w-8 h-8 text-primary-foreground" />
                </div>
              )}
            </div>
            <DialogTitle className="text-center text-xl">
              {settings?.hospital_name || 'Hospital Management'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {(Object.keys(roleConfig) as LoginRole[]).filter(Boolean).map((role) => {
              if (!role) return null;
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <Button
                  key={role}
                  variant="outline"
                  className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </Button>
              );
            })}
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
            Back to Home
          </Button>
        </DialogContent>
      </Dialog>

      {/* Login Form */}
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Hospital Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <RoleIcon className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {settings?.hospital_name || 'Hospital Management'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {selectedRole ? `${roleConfig[selectedRole].label} Login` : 'Staff Login'}
            </CardDescription>
          </div>
          {selectedRole && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowRoleDialog(true)}
              className="text-primary"
            >
              Change Login Type
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !selectedRole}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
