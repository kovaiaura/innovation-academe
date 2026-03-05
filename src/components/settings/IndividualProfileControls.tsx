import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Bell, MapPin, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProfileControl {
  id: string;
  name: string;
  email: string;
  role: string;
  position_name: string | null;
  enable_notifications: boolean;
  enable_gps_tracking: boolean;
}

export function IndividualProfileControls() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['individual-profile-controls'],
    queryFn: async () => {
      // Get all profiles with position info
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, position_name, designation, enable_notifications, enable_gps_tracking, position_id')
        .not('position_id', 'is', null)
        .order('name');

      if (error) throw error;

      // Also get user roles
      const userIds = (data || []).map(p => p.id);
      let roleMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        roles?.forEach(r => { roleMap[r.user_id] = r.role; });
      }

      return (data || []).map((p) => ({
        id: p.id,
        name: p.name || 'Unknown',
        email: p.email || '',
        role: roleMap[p.id] || 'staff',
        position_name: p.position_name || p.designation || null,
        enable_notifications: p.enable_notifications ?? true,
        enable_gps_tracking: p.enable_gps_tracking ?? true,
      })) as ProfileControl[];
    },
  });

  const handleToggle = async (profileId: string, field: 'enable_notifications' | 'enable_gps_tracking', value: boolean) => {
    setUpdatingId(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profileId);

      if (error) throw error;

      queryClient.setQueryData(['individual-profile-controls'], (old: ProfileControl[] | undefined) =>
        (old || []).map(p => p.id === profileId ? { ...p, [field]: value } : p)
      );

      toast.success(`${field === 'enable_notifications' ? 'Notifications' : 'GPS tracking'} ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update setting');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Individual Profile Controls
        </CardTitle>
        <CardDescription>
          Enable or disable notifications and GPS tracking for each user individually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Bell className="h-3.5 w-3.5" />
                    Notifications
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    GPS Tracking
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {profile.position_name || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={profile.enable_notifications}
                        disabled={updatingId === profile.id}
                        onCheckedChange={(v) => handleToggle(profile.id, 'enable_notifications', v)}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={profile.enable_gps_tracking}
                        disabled={updatingId === profile.id}
                        onCheckedChange={(v) => handleToggle(profile.id, 'enable_gps_tracking', v)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {profiles.length} users
        </p>
      </CardContent>
    </Card>
  );
}
