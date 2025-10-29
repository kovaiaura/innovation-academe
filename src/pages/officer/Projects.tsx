import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Upload, Award, Edit } from "lucide-react";
import { toast } from "sonner";
import { 
  mockProjects, 
  getProjectsByInstitution, 
  updateProject,
  addProject,
  addProgressUpdate,
  Project 
} from "@/data/mockProjectData";
import { CreateProjectDialog } from "@/components/project/CreateProjectDialog";
import { ProgressUpdateDialog } from "@/components/project/ProgressUpdateDialog";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";
import { MarkAsShowcaseDialog } from "@/components/project/MarkAsShowcaseDialog";

export default function OfficerProjects() {
  const institutionId = 'springfield';
  const officerId = 'off1';
  const officerName = 'Dr. Rajesh Kumar';

  const [projects, setProjects] = useState(getProjectsByInstitution(institutionId));
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isShowcaseDialogOpen, setIsShowcaseDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project => 
    filterStatus === "all" || project.status === filterStatus
  );

  const handleCreateProject = (newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: `proj-${Date.now()}`
    };
    addProject(institutionId, project);
    setProjects(getProjectsByInstitution(institutionId));
    toast.success("Project created successfully");
  };

  const handleProgressUpdate = (notes: string, progress: number) => {
    if (!selectedProject) return;

    const update = {
      date: new Date().toISOString().split('T')[0],
      notes,
      updated_by: officerName
    };

    addProgressUpdate(institutionId, selectedProject.id, update);
    updateProject(institutionId, selectedProject.id, { progress });
    setProjects(getProjectsByInstitution(institutionId));
    toast.success("Progress updated successfully");
  };

  const handleMarkAsShowcase = (achievements: string[], awards: string[]) => {
    if (!selectedProject) return;

    updateProject(institutionId, selectedProject.id, {
      is_showcase: true,
      achievements,
      awards
    });
    setProjects(getProjectsByInstitution(institutionId));
  };

  const handleApprove = (projectId: string) => {
    updateProject(institutionId, projectId, { 
      status: 'approved',
      funding_approved: projects.find(p => p.id === projectId)?.funding_required 
    });
    setProjects(getProjectsByInstitution(institutionId));
    toast.success("Project approved successfully");
  };

  const handleReject = (projectId: string) => {
    updateProject(institutionId, projectId, { status: 'rejected' });
    setProjects(getProjectsByInstitution(institutionId));
    toast.error("Project rejected");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      'proposal': { className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending Review' },
      'approved': { className: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Approved' },
      'in_progress': { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Progress' },
      'completed': { className: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Completed' },
      'rejected': { className: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' }
    };
    return variants[status] || { className: '', label: status };
  };

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const pendingProposals = projects.filter(p => p.status === 'proposal');

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Innovation Projects</h1>
          <p className="text-muted-foreground">
            Create, manage, and mentor student innovation projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProposals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="proposal">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {filteredProjects.map((project) => {
            const statusInfo = getStatusBadge(project.status);
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {project.title}
                        {project.is_showcase && (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            ⭐ Showcase
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  {project.status !== 'proposal' && project.status !== 'rejected' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                  )}

                  {/* Project Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="font-medium">{project.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Team Size</span>
                      <p className="font-medium">{project.team_members.length} students</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Class</span>
                      <p className="font-medium">{project.class}</p>
                    </div>
                    {project.funding_required && (
                      <div>
                        <span className="text-muted-foreground">Funding</span>
                        <p className="font-medium">₹{project.funding_required.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {project.status === 'proposal' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(project.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(project.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {(project.status === 'approved' || project.status === 'in_progress') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsProgressDialogOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Progress
                      </Button>
                    )}

                    {project.status === 'completed' && !project.is_showcase && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsShowcaseDialogOpen(true);
                        }}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Mark as Showcase
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredProjects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No projects found for the selected filter</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateProject={handleCreateProject}
        officerId={officerId}
        officerName={officerName}
        institutionId={institutionId}
      />

      <ProgressUpdateDialog
        open={isProgressDialogOpen}
        onOpenChange={setIsProgressDialogOpen}
        projectTitle={selectedProject?.title || ""}
        currentProgress={selectedProject?.progress || 0}
        onSubmit={handleProgressUpdate}
      />

      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
      />

      <MarkAsShowcaseDialog
        open={isShowcaseDialogOpen}
        onOpenChange={setIsShowcaseDialogOpen}
        projectTitle={selectedProject?.title || ""}
        onSubmit={handleMarkAsShowcase}
      />
    </Layout>
  );
}
