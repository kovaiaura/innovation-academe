import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, ArrowRight, Users, GitBranch, Info, Crown, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { approvalHierarchyService } from '@/services/leave.service';
import { positionService } from '@/services/position.service';
import { UserType } from '@/types/leave';

export default function GlobalApprovalConfig() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogApplicantType, setDialogApplicantType] = useState<UserType>('officer');
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

  // Filter for global hierarchies (applicant_position_id is NULL)
  const officerHierarchies = allHierarchies.filter(
    h => h.applicant_type === 'officer' && !h.applicant_position_id
  ).sort((a, b) => a.approval_order - b.approval_order);

  const staffHierarchies = allHierarchies.filter(
    h => h.applicant_type === 'staff' && !h.applicant_position_id
  ).sort((a, b) => a.approval_order - b.approval_order);

  // Get CEO position
  const ceoPosition = allPositions.find(p => p.is_ceo_position);

  const createMutation = useMutation({
    mutationFn: approvalHierarchyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-hierarchies'] });
      toast.success('Approver added to chain');
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
      toast.success('Approver removed from chain');
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

  const handleOpenDialog = (type: UserType) => {
    setDialogApplicantType(type);
    setIsDialogOpen(true);
  };

  const handleAddApprover = () => {
    if (!selectedApproverPosition) {
      toast.error('Please select an approver position');
      return;
    }

    const currentChain = dialogApplicantType === 'officer' ? officerHierarchies : staffHierarchies;
    const nextOrder = currentChain.length > 0 
      ? Math.max(...currentChain.map(h => h.approval_order)) + 1 
      : 1;

    createMutation.mutate({
      applicant_type: dialogApplicantType,
      applicant_position_id: null, // NULL means global chain
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

  const isCEOPosition = (positionId: string) => {
    const pos = allPositions.find(p => p.id === positionId);
    return pos?.is_ceo_position || false;
  };

  const getAvailableApprovers = (type: UserType) => {
    const currentChain = type === 'officer' ? officerHierarchies : staffHierarchies;
    return allPositions.filter(p => 
      !currentChain.some(h => h.approver_position_id === p.id)
    );
  };

  const availableApprovers = getAvailableApprovers(dialogApplicantType);

  const renderApprovalChain = (
    type: UserType, 
    hierarchies: typeof officerHierarchies, 
    icon: React.ReactNode,
    badgeClass: string,
    label: string
  ) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {icon}
              {label} Leave Approval Chain
            </CardTitle>
            <CardDescription>
              When any {label.toLowerCase()} applies for leave, approvals follow this sequence
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog(type)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Approver
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Chain */}
        {hierarchies.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium">No Approval Chain Configured</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add approvers to create the leave approval workflow for {label.toLowerCase()}s
            </p>
            <Button className="mt-4" onClick={() => handleOpenDialog(type)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Approver
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={`py-2 px-4 ${badgeClass}`}>
              <Users className="h-4 w-4 mr-2" />
              {label} (Applicant)
            </Badge>
            {hierarchies.map((h, index) => (
              <div key={h.id} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge 
                  className={`py-2 px-4 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group ${
                    isCEOPosition(h.approver_position_id) ? 'bg-primary' : 'bg-green-500/20 text-green-700'
                  }`}
                  onClick={() => handleDeleteApprover(h.id)}
                >
                  <span className="group-hover:hidden flex items-center gap-2">
                    {isCEOPosition(h.approver_position_id) && <Crown className="h-3 w-3" />}
                    {index + 1}. {getPositionName(h.approver_position_id)}
                  </span>
                  <span className="hidden group-hover:inline"><Trash2 className="h-3 w-3" /></span>
                  {h.is_final_approver && <span className="ml-2 text-xs opacity-70">(Final)</span>}
                  {h.is_optional && <span className="ml-2 text-xs opacity-70">(Optional)</span>}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {hierarchies.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Chain Details</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Approver Position</TableHead>
                  <TableHead>CEO</TableHead>
                  <TableHead>Final Approver</TableHead>
                  <TableHead>Optional</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hierarchies.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <Badge variant="outline">{h.approval_order}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isCEOPosition(h.approver_position_id) && (
                          <Crown className="h-4 w-4 text-primary" />
                        )}
                        {getPositionName(h.approver_position_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCEOPosition(h.approver_position_id) ? (
                        <Badge className="bg-primary/20 text-primary">Yes</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {h.is_final_approver ? (
                        <Badge className="bg-green-500/20 text-green-600">Yes</Badge>
                      ) : 'No'}
                    </TableCell>
                    <TableCell>{h.is_optional ? 'Yes' : 'No'}</TableCell>
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
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Global Leave Approval Configuration</h1>
          <p className="text-muted-foreground">
            Configure who approves leave applications for Officers and Staff across the organization
          </p>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>How it works:</strong> When an Officer or Staff member submits a leave request, it goes through the approval chain you configure here.
            Each approver is notified in sequence (1st → 2nd → ...). The final approver's decision completes the request.
          </AlertDescription>
        </Alert>

        {/* Officer Approval Chain */}
        {renderApprovalChain(
          'officer',
          officerHierarchies,
          <GitBranch className="h-5 w-5" />,
          'bg-blue-500/20 text-blue-700',
          'Officer'
        )}

        {/* Staff Approval Chain */}
        {renderApprovalChain(
          'staff',
          staffHierarchies,
          <Briefcase className="h-5 w-5" />,
          'bg-purple-500/20 text-purple-700',
          'Staff'
        )}

        {/* Add Approver Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Approver to {dialogApplicantType === 'officer' ? 'Officer' : 'Staff'} Chain</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Approver Position</Label>
                <Select value={selectedApproverPosition} onValueChange={setSelectedApproverPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableApprovers.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        <div className="flex items-center gap-2">
                          {pos.is_ceo_position && <Crown className="h-4 w-4 text-primary" />}
                          {pos.display_name}
                        </div>
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
      </div>
    </Layout>
  );
}