import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Shield, Users, Key, Trash2, Crown, Search, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { positionService } from '@/services/position.service';
import { metaStaffService } from '@/services/metastaff.service';
import { CustomPosition, SystemAdminFeature } from '@/types/permissions';
import { User } from '@/types';
import { CreatePositionDialog } from '@/components/position/CreatePositionDialog';
import { EditPositionDialog } from '@/components/position/EditPositionDialog';
import { PositionCard } from '@/components/position/PositionCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, AlertTriangle } from 'lucide-react';

export default function PositionManagement() {
  const { user } = useAuth();
  const [positions, setPositions] = useState<CustomPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<CustomPosition | null>(null);
  const [positionUsers, setPositionUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    position_id: '',
  });
  const [credentialsDialog, setCredentialsDialog] = useState<{
    open: boolean;
    email: string;
    password: string;
    name: string;
  }>({
    open: false,
    email: '',
    password: '',
    name: '',
  });

  useEffect(() => {
    loadPositions();
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      loadPositionUsers(selectedPosition.id);
    }
  }, [selectedPosition]);

  const loadPositions = async () => {
    try {
      const data = await positionService.getAllPositions();
      setPositions(data);
      if (!selectedPosition && data.length > 0) {
        setSelectedPosition(data[0]);
      }
    } catch (error) {
      toast.error('Failed to load positions');
    }
  };

  const loadPositionUsers = async (positionId: string) => {
    try {
      const users = await positionService.getUsersByPosition(positionId);
      setPositionUsers(users);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleCreatePosition = async (data: {
    position_name: string;
    display_name: string;
    description: string;
    visible_features: SystemAdminFeature[];
  }) => {
    setIsLoading(true);
    try {
      await positionService.createPosition({
        position_name: data.position_name,
        display_name: data.display_name || data.position_name,
        description: data.description,
        visible_features: data.visible_features,
      });
      toast.success('Position created successfully');
      setIsCreateDialogOpen(false);
      loadPositions();
    } catch (error) {
      toast.error('Failed to create position');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPosition = async (data: {
    position_name: string;
    display_name: string;
    description: string;
    visible_features: SystemAdminFeature[];
  }) => {
    if (!selectedPosition) return;

    setIsLoading(true);
    try {
      await positionService.updatePosition(selectedPosition.id, data);
      toast.success('Position updated successfully');
      setIsEditDialogOpen(false);
      loadPositions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update position');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePosition = async (position: CustomPosition) => {
    if (!confirm(`Are you sure you want to delete "${position.display_name}"?`)) return;

    setIsLoading(true);
    try {
      await positionService.deletePosition(position.id);
      toast.success('Position deleted successfully');
      loadPositions();
      if (selectedPosition?.id === position.id) {
        setSelectedPosition(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete position');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.position_id) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await metaStaffService.createMetaStaff(newUserData);
      toast.success('User added successfully');
      setIsAddUserDialogOpen(false);
      setNewUserData({ name: '', email: '', position_id: '' });

      setCredentialsDialog({
        open: true,
        email: result.user.email,
        password: result.password,
        name: result.user.name,
      });

      if (selectedPosition) {
        loadPositionUsers(selectedPosition.id);
      }
      loadPositions();
    } catch (error) {
      toast.error('Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (userId: string, userName: string, userEmail: string) => {
    try {
      const newPassword = await metaStaffService.resetPassword(userId);
      setCredentialsDialog({
        open: true,
        email: userEmail,
        password: newPassword,
        name: userName,
      });
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    setIsLoading(true);
    try {
      await metaStaffService.deleteMetaStaff(userId);
      toast.success('User removed successfully');
      if (selectedPosition) {
        loadPositionUsers(selectedPosition.id);
      }
      loadPositions();
    } catch (error) {
      toast.error('Failed to remove user');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `Login Credentials\nName: ${credentialsDialog.name}\nEmail: ${credentialsDialog.email}\nPassword: ${credentialsDialog.password}`;
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard');
  };

  const filteredPositions = positions.filter(
    (pos) =>
      pos.position_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-muted-foreground">Create custom positions and configure sidebar access</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Position
          </Button>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            Create unlimited custom positions (e.g., Project Coordinator, HR Manager, Sales Executive) and configure
            which sidebar menus each position can access. Users assigned to these positions will only see their configured menus.
          </AlertDescription>
        </Alert>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary">{positions.length} positions</Badge>
        </div>

        {/* Position Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              isSelected={selectedPosition?.id === position.id}
              userCount={position.user_count || 0}
              isCEO={user?.is_ceo === true}
              onSelect={() => setSelectedPosition(position)}
              onEdit={() => {
                setSelectedPosition(position);
                setIsEditDialogOpen(true);
              }}
              onDelete={() => handleDeletePosition(position)}
            />
          ))}
        </div>

        {/* Selected Position Details */}
        {selectedPosition && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedPosition.is_ceo_position && <Crown className="h-5 w-5 text-yellow-600" />}
                    {selectedPosition.display_name}
                  </CardTitle>
                  <CardDescription>{selectedPosition.description}</CardDescription>
                </div>
                <Button onClick={() => setIsAddUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assigned Users</span>
                  <Badge>{positionUsers.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Visible Menus</span>
                  <Badge>{selectedPosition.visible_features.length}</Badge>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium text-sm">Assigned Users</h4>
                  {positionUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No users assigned</p>
                  ) : (
                    positionUsers.map((metaUser) => (
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPassword(metaUser.id, metaUser.name, metaUser.email)}
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteUser(metaUser.id)}
                            title="Remove User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Position Dialog */}
      <CreatePositionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreatePosition}
        isLoading={isLoading}
      />

      {/* Edit Position Dialog */}
      <EditPositionDialog
        position={selectedPosition}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditPosition}
        isLoading={isLoading}
      />

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Position</DialogTitle>
            <DialogDescription>Create a new user and assign them to a position</DialogDescription>
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
                value={newUserData.position_id}
                onValueChange={(value) => setNewUserData({ ...newUserData, position_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
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

      {/* Credentials Display Dialog */}
      <Dialog
        open={credentialsDialog.open}
        onOpenChange={(open) => setCredentialsDialog({ ...credentialsDialog, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Login Credentials Created
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Save these credentials now! This is the only time the password will be shown.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-medium">{credentialsDialog.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base font-medium">{credentialsDialog.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Temporary Password</label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md font-mono text-sm">
                  <code className="flex-1">{credentialsDialog.password}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyCredentials} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy Credentials
              </Button>
              <Button
                variant="outline"
                onClick={() => setCredentialsDialog({ ...credentialsDialog, open: false })}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
