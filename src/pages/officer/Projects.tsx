import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Users, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockProjects = [
  {
    id: '1',
    title: 'Smart Campus System',
    description: 'IoT-based system for campus resource management',
    team_lead: 'John Doe',
    team_members: ['Jane Smith', 'Bob Wilson', 'Alice Brown'],
    status: 'proposal' as const,
    category: 'IoT',
    funding_required: 50000,
    progress: 0,
    start_date: '2024-01-15',
  },
  {
    id: '2',
    title: 'Eco-Friendly Transportation App',
    description: 'Mobile app for sustainable campus transportation',
    team_lead: 'Sarah Johnson',
    team_members: ['Mike Davis', 'Emily Chen'],
    status: 'in_progress' as const,
    category: 'Mobile App',
    funding_required: 30000,
    funding_approved: 30000,
    progress: 45,
    start_date: '2024-01-01',
  },
];

export default function OfficerProjects() {
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleApprove = () => {
    toast.success('Project approved successfully!');
    setIsReviewDialogOpen(false);
  };

  const handleReject = () => {
    toast.success('Project rejected');
    setIsReviewDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      proposal: { className: 'bg-yellow-500/10 text-yellow-500', label: 'Proposal' },
      approved: { className: 'bg-green-500/10 text-green-500', label: 'Approved' },
      in_progress: { className: 'bg-blue-500/10 text-blue-500', label: 'In Progress' },
      completed: { className: 'bg-purple-500/10 text-purple-500', label: 'Completed' },
      rejected: { className: 'bg-red-500/10 text-red-500', label: 'Rejected' },
    };
    return variants[status] || variants.proposal;
  };

  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Innovation Projects</h1>
          <p className="text-muted-foreground">Review and manage student innovation projects</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="proposal">Proposals</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredProjects.map((project) => {
          const statusInfo = getStatusBadge(project.status);
          return (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  {project.status === 'proposal' && (
                    <Button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsReviewDialogOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{project.team_lead}</p>
                      <p className="text-muted-foreground">Team Lead</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{project.team_members.length + 1}</p>
                      <p className="text-muted-foreground">Team Size</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">₹{project.funding_required.toLocaleString()}</p>
                      <p className="text-muted-foreground">Funding Required</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{project.progress}%</p>
                      <p className="text-muted-foreground">Progress</p>
                    </div>
                  </div>
                </div>
                {project.status === 'in_progress' && (
                  <div className="mt-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Project: {selectedProject?.title}</DialogTitle>
            <DialogDescription>Review and approve or reject this innovation project</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Project Details</h4>
                  <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Team Lead</Label>
                    <p className="font-medium">{selectedProject.team_lead}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium">{selectedProject.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Funding Required</Label>
                    <p className="font-medium">₹{selectedProject.funding_required.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Team Members</Label>
                    <p className="font-medium">{selectedProject.team_members.length + 1}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Team Members</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.team_members.map((member: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="funding_approved">Approved Funding Amount (₹)</Label>
                  <Input
                    id="funding_approved"
                    type="number"
                    placeholder={selectedProject.funding_required.toString()}
                    defaultValue={selectedProject.funding_required}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comments">Comments/Feedback</Label>
                  <Textarea id="comments" placeholder="Add your review comments..." rows={4} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}
