import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Users, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { metaStaffService } from '@/services/metastaff.service';
import { getAllPositions, getPositionDisplayName } from '@/data/mockPositionPermissions';
import { SystemAdminPosition, SystemAdminFeature } from '@/types/permissions';
import { User } from '@/types';

const allFeatures: { value: SystemAdminFeature; label: string }[] = [
  { value: 'institution_management', label: 'Institution Management' },
  { value: 'course_management', label: 'Course Management' },
  { value: 'assessment_management', label: 'Assessment Management' },
  { value: 'assignment_management', label: 'Assignment Management' },
  { value: 'event_management', label: 'Event Management' },
  { value: 'officer_management', label: 'Officer Management' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'inventory_management', label: 'Inventory Management' },
  { value: 'attendance_payroll', label: 'Attendance and Payroll' },
  { value: 'leave_approvals', label: 'Leave Approvals' },
  { value: 'institutional_calendar', label: 'Institutional Calendar' },
  { value: 'reports_analytics', label: 'Reports & Analytics' },
];

export default function PositionManagement() {
  const { user } = useAuth();
  const [selectedPosition, setSelectedPosition] = useState<SystemAdminPosition>('md');
  const [positionFeatures, setPositionFeatures] = useState<SystemAdminFeature[]>([]);
  const [metaStaffUsers, setMetaStaffUsers] = useState<User[]>([]);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', position: 'manager' as SystemAdminPosition });
  const [isLoading, setIsLoading] = useState(false);

  const positions = getAllPositions().filter(p => p.position !== 'ceo');

  useEffect(() => {
    loadMetaStaff();
    loadPositionPermissions(selectedPosition);
  }, []);

  useEffect(() => {
    loadPositionPermissions(selectedPosition);
  }, [selectedPosition]);

  const loadMetaStaff = async () => {
    try {
      const staff = await metaStaffService.getMetaStaff();
      setMetaStaffUsers(staff.filter(s => s.position !== 'ceo'));
    } catch (error) {
      toast.error('Failed to load meta staff');
    }
  };

  const loadPositionPermissions = async (position: SystemAdminPosition) => {
    try {
      const features = await metaStaffService.getPositionPermissions(position);
      setPositionFeatures(features);
    } catch (error) {
      toast.error('Failed to load permissions');
    }
  };

  const handleFeatureToggle = (feature: SystemAdminFeature) => {
    setPositionFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSavePermissions = async () => {
    setIsLoading(true);
    try {
      await metaStaffService.updatePositionPermissions(selectedPosition, positionFeatures);
      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await metaStaffService.createMetaStaff(newUserData);
      toast.success('Meta staff added successfully');
      setIsAddUserDialogOpen(false);
      setNewUserData({ name: '', email: '', position: 'manager' });
      loadMetaStaff();
    } catch (error) {
      toast.error('Failed to add meta staff');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    setIsLoading(true);
    try {
      await metaStaffService.deleteMetaStaff(userId);
      toast.success('User removed successfully');
      loadMetaStaff();
    } catch (error) {
      toast.error('Failed to remove user');
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionCount = (position: SystemAdminPosition) => {
    return metaStaffUsers.filter(u => u.position === position).length;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Position Management
            </h1>
            <p className="text-muted-foreground">Manage meta staff positions and their permissions</p>
          </div>
          <Button onClick={() => setIsAddUserDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meta Staff
          </Button>
        </div>

        {/* Position Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          {positions.map((position) => (
            <Card
              key={position.position}
              className={`cursor-pointer transition-all ${
                selectedPosition === position.position
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPosition(position.position)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{position.display_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">{getPositionCount(position.position)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Permissions Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                Permissions for {getPositionDisplayName(selectedPosition)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select which features this position can access
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allFeatures.map((feature) => (
                  <div key={feature.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.value}
                      checked={positionFeatures.includes(feature.value)}
                      onCheckedChange={() => handleFeatureToggle(feature.value)}
                    />
                    <Label htmlFor={feature.value} className="cursor-pointer">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
              <Button onClick={handleSavePermissions} disabled={isLoading} className="w-full">
                Save Permissions
              </Button>
            </CardContent>
          </Card>

          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Users</CardTitle>
              <p className="text-sm text-muted-foreground">
                Users with {getPositionDisplayName(selectedPosition)} position
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metaStaffUsers
                  .filter(u => u.position === selectedPosition)
                  .map((metaUser) => (
                    <div
                      key={metaUser.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{metaUser.name}</p>
                          <p className="text-sm text-muted-foreground">{metaUser.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(metaUser.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {metaStaffUsers.filter(u => u.position === selectedPosition).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No users assigned to this position
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Meta Staff User</DialogTitle>
            <DialogDescription>
              Create a new meta staff user and assign them a position
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Select
                value={newUserData.position}
                onValueChange={(value) =>
                  setNewUserData({ ...newUserData, position: value as SystemAdminPosition })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.position} value={pos.position}>
                      {pos.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={isLoading}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
