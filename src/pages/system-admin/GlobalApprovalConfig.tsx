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
import { Plus, Trash2, ArrowRight, Users, GitBranch, Info, Crown, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { approvalHierarchyService } from '@/services/leave.service';
import { positionService } from '@/services/position.service';
import { LeaveApprovalHierarchy } from '@/types/leave';

export default function GlobalApprovalConfig() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Filter for officer-type hierarchies (no applicant_position_id means it's for officers)
  const officerHierarchies = allHierarchies.filter(
    h => h.applicant_type === 'officer' && !h.applicant_position_id
  ).sort((a, b) => a.approval_order - b.approval_order);

  // Get CEO position
  const ceoPosition = allPositions.find(p => p.is_ceo_position);
  const isCEOInChain = officerHierarchies.some(h => h.approver_position_id === ceoPosition?.id);

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

  const handleAddApprover = () => {
    if (!selectedApproverPosition) {
      toast.error('Please select an approver position');
      return;
    }

    const nextOrder = officerHierarchies.length > 0 
      ? Math.max(...officerHierarchies.map(h => h.approval_order)) + 1 
      : 1;

    createMutation.mutate({
      applicant_type: 'officer',
      applicant_position_id: null,
      approver_position_id: selectedApproverPosition,
      approval_order: nextOrder,
      is_final_approver: isFinalApprover,
      is_optional: isOptional
    });
  };

  const handleAddCEO = () => {
    if (!ceoPosition) {
      toast.error('CEO position not configured');
      return;
    }

    const nextOrder = officerHierarchies.length > 0 
      ? Math.max(...officerHierarchies.map(h => h.approval_order)) + 1 
      : 1;

    createMutation.mutate({
      applicant_type: 'officer',
      applicant_position_id: null,
      approver_position_id: ceoPosition.id,
      approval_order: nextOrder,
      is_final_approver: true,
      is_optional: false
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

  const availableApprovers = allPositions.filter(p => 
    !officerHierarchies.some(h => h.approver_position_id === p.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Global Approval Configuration</h1>
          <p className="text-muted-foreground">
            Configure the leave approval chain for officers (company-wide)
          </p>
        </div>

        {/* CEO Quick Add */}
        {ceoPosition && !isCEOInChain && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Add CEO as Final Approver</h3>
                    <p className="text-sm text-muted-foreground">
                      {ceoPosition.display_name} can be added as the final authority in the approval chain
                    </p>
                  </div>
                </div>
                <Button onClick={handleAddCEO} disabled={createMutation.isPending}>
                  <Crown className="h-4 w-4 mr-2" />
                  Add CEO to Chain
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Officer Approval Chain */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Officer Leave Approval Chain
                </CardTitle>
                <CardDescription>
                  This chain applies to all officers across the organization
                </CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Approver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Leave applications from officers will follow this approval chain. 
                Each approver is notified in sequence, and the final approver's decision completes the request.
              </AlertDescription>
            </Alert>

            {/* Visual Chain */}
            {officerHierarchies.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-muted/30">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium">No Approval Chain Configured</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add approvers to create the leave approval workflow for officers
                </p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Approver
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="py-2 px-4">
                  <Users className="h-4 w-4 mr-2" />
                  Officer (Applicant)
                </Badge>
                {officerHierarchies.map((h) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge 
                      className={`py-2 px-4 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group ${
                        isCEOPosition(h.approver_position_id) ? 'bg-primary' : ''
                      }`}
                      onClick={() => handleDeleteApprover(h.id)}
                    >
                      <span className="group-hover:hidden flex items-center gap-2">
                        {isCEOPosition(h.approver_position_id) && <Crown className="h-3 w-3" />}
                        {getPositionName(h.approver_position_id)}
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
            {officerHierarchies.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Chain Details</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>CEO</TableHead>
                      <TableHead>Final Approver</TableHead>
                      <TableHead>Optional</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {officerHierarchies.map(h => (
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

        {/* Add Approver Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Approver to Officer Chain</DialogTitle>
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
