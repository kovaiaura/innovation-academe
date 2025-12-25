import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, ArrowRight, Users, GitBranch, Info, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { approvalHierarchyService } from '@/services/leave.service';
import { positionService } from '@/services/position.service';
import { CustomPosition } from '@/types/permissions';
import { LeaveApprovalHierarchy, UserType } from '@/types/leave';

interface Props {
  position: CustomPosition;
}

export function ApprovalHierarchyConfig({ position }: Props) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicantType, setApplicantType] = useState<UserType>('officer');
  const [selectedApproverPosition, setSelectedApproverPosition] = useState('');
  const [isFinalApprover, setIsFinalApprover] = useState(false);
  const [isOptional, setIsOptional] = useState(false);

  const { data: allPositions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: () => positionService.getAllPositions()
  });

  const { data: allHierarchies = [], isLoading } = useQuery({
    queryKey: ['approval-hierarchies'],
    queryFn: () => approvalHierarchyService.getAll()
  });

  // Filter hierarchies for the current position
  const positionHierarchies = allHierarchies.filter(h => h.applicant_position_id === position.id);
  
  // Group by applicant type
  const groupedHierarchies = positionHierarchies.reduce((acc, h) => {
    if (!acc[h.applicant_type]) acc[h.applicant_type] = [];
    acc[h.applicant_type].push(h);
    acc[h.applicant_type].sort((a, b) => a.approval_order - b.approval_order);
    return acc;
  }, {} as Record<UserType, LeaveApprovalHierarchy[]>);

  const createMutation = useMutation({
    mutationFn: approvalHierarchyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-hierarchies'] });
      toast.success('Approver added successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: approvalHierarchyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-hierarchies'] });
      toast.success('Approver removed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedApproverPosition('');
    setIsFinalApprover(false);
    setIsOptional(false);
  };

  const handleAddApprover = () => {
    if (!selectedApproverPosition) {
      toast.error('Please select an approver position');
      return;
    }

    // Calculate next order for this applicant type
    const existingOrders = (groupedHierarchies[applicantType] || []).map(h => h.approval_order);
    const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1;

    createMutation.mutate({
      applicant_type: applicantType,
      applicant_position_id: position.id,
      approver_position_id: selectedApproverPosition,
      approval_order: nextOrder,
      is_final_approver: isFinalApprover,
      is_optional: isOptional
    });
  };

  const handleDeleteApprover = (id: string) => {
    if (confirm('Remove this approver from the chain?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPositionName = (positionId: string) => {
    const pos = allPositions.find(p => p.id === positionId);
    return pos?.display_name || 'Unknown';
  };

  const availableApprovers = allPositions.filter(p => 
    p.id !== position.id && 
    !(groupedHierarchies[applicantType] || []).some(h => h.approver_position_id === p.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Leave Approval Chain
        </CardTitle>
        <CardDescription>
          Configure who approves leave applications for users in this position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Define the approval chain for leave applications. Approvers are notified in order.
            The final approver's decision will complete the leave request.
          </AlertDescription>
        </Alert>

        {/* Officer Approval Chain */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Officer</Badge>
              <span className="text-sm text-muted-foreground">When user type is Officer</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setApplicantType('officer');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Approver
            </Button>
          </div>
          
          {(groupedHierarchies.officer || []).length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30">
              No approval chain configured. Leave applications will need manual processing.
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="py-1.5 px-3">
                <Users className="h-3 w-3 mr-1" />
                {position.display_name}
              </Badge>
              {groupedHierarchies.officer.map((h, index) => (
                <div key={h.id} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    className="py-1.5 px-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                    onClick={() => handleDeleteApprover(h.id)}
                  >
                    <span className="group-hover:hidden">{getPositionName(h.approver_position_id)}</span>
                    <span className="hidden group-hover:inline"><Trash2 className="h-3 w-3" /></span>
                    {h.is_final_approver && <span className="ml-1 text-xs opacity-70">(Final)</span>}
                    {h.is_optional && <span className="ml-1 text-xs opacity-70">(Optional)</span>}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staff Approval Chain */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Staff</Badge>
              <span className="text-sm text-muted-foreground">When user type is Staff</span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setApplicantType('staff');
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Approver
            </Button>
          </div>
          
          {(groupedHierarchies.staff || []).length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30">
              No approval chain configured for staff.
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="py-1.5 px-3">
                <Users className="h-3 w-3 mr-1" />
                {position.display_name}
              </Badge>
              {groupedHierarchies.staff.map((h, index) => (
                <div key={h.id} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    className="py-1.5 px-3 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                    onClick={() => handleDeleteApprover(h.id)}
                  >
                    <span className="group-hover:hidden">{getPositionName(h.approver_position_id)}</span>
                    <span className="hidden group-hover:inline"><Trash2 className="h-3 w-3" /></span>
                    {h.is_final_approver && <span className="ml-1 text-xs opacity-70">(Final)</span>}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Hierarchies Table */}
        {positionHierarchies.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">All Configured Approvers</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Applicant Type</TableHead>
                  <TableHead>Approver Position</TableHead>
                  <TableHead>Final</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionHierarchies.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <Badge variant="outline">{h.approval_order}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{h.applicant_type}</TableCell>
                    <TableCell>{getPositionName(h.approver_position_id)}</TableCell>
                    <TableCell>
                      {h.is_final_approver ? (
                        <Badge className="bg-green-500/20 text-green-600">Yes</Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {h.is_optional ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteApprover(h.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Approver Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Approver to Chain</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Applicant Type</Label>
              <Select value={applicantType} onValueChange={(v) => setApplicantType(v as UserType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Approver Position</Label>
              <Select value={selectedApproverPosition} onValueChange={setSelectedApproverPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position..." />
                </SelectTrigger>
                <SelectContent>
                  {availableApprovers.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableApprovers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All positions are already in the approval chain
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Final Approver</Label>
                <p className="text-xs text-muted-foreground">This approver's decision is final</p>
              </div>
              <Switch checked={isFinalApprover} onCheckedChange={setIsFinalApprover} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Optional</Label>
                <p className="text-xs text-muted-foreground">Can be skipped in the chain</p>
              </div>
              <Switch checked={isOptional} onCheckedChange={setIsOptional} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleAddApprover} 
              disabled={createMutation.isPending || !selectedApproverPosition}
            >
              Add Approver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
